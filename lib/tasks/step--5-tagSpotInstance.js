"use strict";

module.exports = function tagSpotInstance(ec2, name, requestAndInstance, callback) {
    console.log("[5] Also tagging the instance, this way we don't have untagged instances lying around...");
    ec2.createTags({
        Resources: [
            requestAndInstance.instance.InstanceId
        ],
        Tags: [{
            Key: 'Name',
            Value: name
        }]
    }, function (error, tagInfo) {
        callback(error, requestAndInstance);
    });
};