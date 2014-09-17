"use strict";

var async = require("async");

module.exports = function (ec2, keepAlive, requestAndInstanceAndSsh, callback) {
    console.log("[12] Cancel the ec2 resources");
    if (keepAlive) {
        console.log("... skipping because spec.keepAlive=true");
        return callback(null, requestAndInstanceAndSsh);
    }
    var request = requestAndInstanceAndSsh.request,
        ssh = requestAndInstanceAndSsh.ssh;
    console.log("... ending ssh");
    ssh.end();
    console.log("... cancelling spot instance & request");
    
    async.series([
        ec2.terminateInstances.bind(ec2, {
            InstanceIds: [request.InstanceId]
        }),
        ec2.cancelSpotInstanceRequests.bind(ec2, {
            SpotInstanceRequestIds: [request.SpotInstanceRequestId]
        })
    ], function(error) {
        callback(error, requestAndInstanceAndSsh);
    });
};