"use strict";

var Joi = require("joi"),
    AWS = require("aws-sdk"),
    explicit = require("explicit"),
    async = require("async"),
    dateformat = require("dateformat");

module.exports = explicit({
    $one: true,
    $args: [
        Joi.string().meta("name"),
        Joi.object().meta("credentials").keys({
            "accessKeyId":     Joi.string().required(),
            "secretAccessKey": Joi.string().required(),
            "region":          Joi.string().required(),
            "sslEnabled":      Joi.boolean().default(true)
        }).required(),
        Joi.object().meta("spec").keys({
            "ami":           Joi.string().required(),
            "bidding":       Joi.number().min(0).invalid(0).required(),
            "type":          Joi.string().default("t2.micro").required(),
            "key":           Joi.string().required(),
            "subnet":        Joi.string().required(),
            "securityGroup": Joi.string().required(),
            "instanceStorage": Joi.boolean().default(false),
            "keepAlive":     Joi.boolean().default(false)
        }).required(),
        Joi.object().meta("access").keys({
            "user":          Joi.string().default("ec2-user").required(),
            "privateKey":    Joi.string().default().required()
        }),
        Joi.string().meta("imports"),
        /*
        Not until a fixed version of joi is available
        Joi.alternatives().meta("imports").try(
            Joi.object().default({}).unknown(true).required(),
            Joi.string()
        ),*/
        Joi.object().meta("s3").keys({
            "in": Joi.object().keys({
                bucket: Joi.string(),
                file: Joi.string()
            }),
            "out": Joi.object().keys({
                bucket: Joi.string(),
                prefix: Joi.string()
            })
        }).optional(),
        Joi.boolean().meta("useDocker").default(true)
    ],
    $: function (name, credentials, spec, access, imports, s3Info, useDocker) {

        var ec2 = new AWS.EC2(credentials),
            s3 = require("./tasks/util/s3")(AWS, credentials),
            version = dateformat(new Date(), "yyyymmdd_HHMMss_Z"),
            tagName = 'Experiments: ' + name + ' (' + version + ')';

        console.log("Starting: " + version);

        async.waterfall([
            require("./tasks/step--1-requestSpotInstance").bind(null, ec2, spec),
            require("./tasks/step--2-tagSpotRequest").bind(null, ec2, tagName),
            require("./tasks/step--3-waitForSpotInstanceToLaunch").bind(null, ec2),
            require("./tasks/step--4-getInstanceData").bind(null, ec2),
            require("./tasks/step--5-tagSpotInstance").bind(null, ec2, tagName),
            require("./tasks/step--6-waitForInstanceToRun").bind(null, ec2),
            require("./tasks/step--7-establishSshConnection").bind(null, access),
            require("./tasks/step--8-uploadCurrentExperiment"),
            require("./tasks/step--9-prepareInAndOut").bind(null, s3, s3Info && s3Info.in, spec),
            require("./tasks/step-10-startExperiment").bind(null, imports, useDocker),
            require("./tasks/step-11-uploadOutToS3").bind(null, version, s3, s3Info && s3Info.out),
            require("./tasks/step-12-cancelSpotRequest").bind(null, ec2, spec.keepAlive),
            require("./tasks/step-13-waitForInstanceTermination").bind(null, ec2, spec.keepAlive),
            require("./tasks/step-14-deleteVolumes").bind(null, ec2, spec.keepAlive),
            require("./tasks/step-15-showStatsForExperiment").bind(null, ec2)
        ], function (error) {
            if (error) {
                console.error("ERROR while executing ec2 experiment: " + error);
                process.exit(1);
                return;
            }
            console.log("~ Ec2 experiment finished successfully! ~");
            process.exit();
        });
    }
});