"use strict";

module.exports = function (ec2, request, callback) {
    console.log("[4] Getting data for the instance (need to know how to access it) [" + request.InstanceId + "]");
    ec2.describeInstances({
        InstanceIds: [request.InstanceId]
    }, function (error, instances) {
        if (error) {
            return callback(error);
        }
        callback(null, {
            request: request,
            instance: instances.Reservations[0].Instances[0]
        });
    });
};