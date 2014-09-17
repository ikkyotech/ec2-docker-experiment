"use strict";

var endlessly = require("./util/endlessly");

module.exports = function (ec2, keepAlive, requestAndInstanceAndSsh, callback) {
    console.log("[13] Wait until instance is terminated");
    if (keepAlive) {
        console.log("... skipping because spec.keepAlive=true");
        return callback(null, requestAndInstanceAndSsh);
    }
    endlessly(function (repeat) {
        ec2.describeInstances({
            InstanceIds: [requestAndInstanceAndSsh.request.InstanceId]
        }, function (error, instances) {
            if (error) {
                return callback(error);
            }
            var instance = instances.Reservations[0].Instances[0];
            if (instance.State.Code === 48) {
                callback(null, requestAndInstanceAndSsh);
            } else {
                repeat(instance.State.Name);
            }
        });
    });
};