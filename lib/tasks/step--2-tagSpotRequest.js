"use strict";

module.exports = function (ec2, name, request, callback) {
    console.log("[2] Tagging spot request in order for other people know about it.")
    var maxTries = 5,
        tries = 0;
    function tryToTag() {
        ec2.createTags({
            Resources: [
                request.SpotInstanceRequestId
            ],
            Tags: [{
                Key: 'Name',
                Value: name
            }]
        }, function (error, tagInfo) {
            if (error) {
                if (tries < maxTries) {
                    tries += 1;
                    console.log("... error while tagging spot request (" + error + ") trying again in 2s (" + tries + "/" + maxTries + ")");
                    setTimeout(tryToTag, 2000);
                    return;
                }
            }
            callback(error, request);
        });   
    }
    tryToTag();
}