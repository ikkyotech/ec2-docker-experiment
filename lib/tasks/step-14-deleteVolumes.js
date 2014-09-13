"use strict";

var async = require("async");

module.exports = function (ec2, requestAndInstanceAndSsh, callback) {
    console.log("[14] Remove instance volumes");
    var request = requestAndInstanceAndSsh.request;
    if (requestAndInstanceAndSsh.instance.BlockDeviceMappings[0].Ebs) {
        ec2.deleteVolume({
            VolumeId: requestAndInstanceAndSsh.instance.BlockDeviceMappings[0].Ebs.VolumeId
        }, function (error) {
            callback(error, requestAndInstanceAndSsh);
        });   
    } else {
        callback(null, requestAndInstanceAndSsh);
    }
};