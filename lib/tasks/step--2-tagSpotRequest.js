"use strict";

module.exports = function (ec2, name, request, callback) {
    console.log("[2] Tagging spot request in order for other people know about it.")
    ec2.createTags({
        Resources: [
            request.SpotInstanceRequestId
        ],
        Tags: [{
            Key: 'Name',
            Value: name
        }]
    }, function (error, tagInfo) {
        callback(error, request);
    });
}