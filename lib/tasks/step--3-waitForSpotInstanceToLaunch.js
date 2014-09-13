"use strict";

var endlessly = require("./util/endlessly");

module.exports = function (ec2, request, callback) {
    console.log("[3] Checking if spot request is active... [" + request.SpotInstanceRequestId + "]");
    endlessly(function (repeat) {
        ec2.describeSpotInstanceRequests({
            "SpotInstanceRequestIds": [request.SpotInstanceRequestId]
        }, function (error, result) {
            if (error) {
                return callback(error);
            }
            var currentRequest = result.SpotInstanceRequests[0];
            if (currentRequest.State === "active") {
                console.log("... active!");
                callback(null, currentRequest);
            } else if (currentRequest.State === "cancelled" || currentRequest.State === "failed" || currentRequest.State === "closed") {
                callback(new Error("Request dropped before it ever became active?! " + currentRequest.State))
            } else {
                repeat(currentRequest.State);
            }
        });
    });
};