"use strict";
module.exports = function requestSpotInstance(ec2, spec, callback) {
    console.log("[1] Requesting spot instance.");
    ec2.requestSpotInstances({
        SpotPrice: '' + spec.bidding,
        InstanceCount: 1,
        LaunchSpecification: {
            ImageId: spec.ami,
            InstanceType: spec.type,
            KeyName: spec.key,
            Monitoring: {
                Enabled: false
            },
            NetworkInterfaces: [{
                Groups: [
                  spec.securityGroup
                ],
                AssociatePublicIpAddress: true,
                DeleteOnTermination: true,
                Description: 'public',
                DeviceIndex: 0,
                SubnetId: spec.subnet
            }]
        },
        Type: "one-time"
    }, function (error, requests) {
        if (error) {
            return callback(error);
        }
        console.log("... created " + requests.SpotInstanceRequests[0].SpotInstanceRequestId);
        callback(null, requests.SpotInstanceRequests[0]);
    });
};