"use strict";

var endlessly = require("./util/endlessly");

module.exports = function (ec2, requestAndInstance, callback) {
    console.log("[6] The instance needs to be up and running");
    endlessly(function (repeat) {
        ec2.describeInstances({
            InstanceIds: [requestAndInstance.request.InstanceId]
        }, function (error, instances) {
            if (error) {
                return callback(error);
            }
            var instance = instances.Reservations[0].Instances[0];
            if (instance.State.Code === 16) {
                // running
                requestAndInstance.instance = instance;
                callback(null, requestAndInstance);
            } else if (instance.State.Code > 16) {
                callback(new Error("Oops, instance was broken before "));
            } else {
                repeat(instance.State.Name);
            }
        });
    });
};