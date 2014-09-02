"use strict";

module.exports = function (ec2, requestAndInstance, callback) {
    console.log("[6] The instance needs to be up and running");
    function waitForIt() {
        ec2.describeInstances({
            InstanceIds: [requestAndInstance.request.InstanceId]
        }, function (error, instances) {
            var instance = instances.Reservations[0].Instances[0];
            if (error) {
                return callback(error);
            }
            if (instance.State.Code === 16) {
                // running
                requestAndInstance.instance = instance;
                callback(null, requestAndInstance);
            } else if (instance.State.Code > 16) {
                callback(new Error("Oops, instance was broken before "));
            } else {
                console.log("... not yet [" + instance.State.Name + "] (waiting 2s)");
                // try in 2s
                setTimeout(waitForIt, 2000);
            }
        });
    }
    waitForIt();
};