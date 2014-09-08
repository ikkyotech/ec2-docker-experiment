"use strict";

var SIZE_MAP = {
    "c1.medium": 350,
    "c1.xlarge":  420,
    "c3.large":  16,
    "c3.xlarge":  40,
    "c3.2xlarge":  80,
    "c3.4xlarge": 160,
    "c3.8xlarge": 320,
    "cc2.8xlarge": 840,
    "cg1.4xlarge": 840,
    "cr1.8xlarge": 120,
    "g2.2xlarge":  60,
    "hi1.4xlarge": 1024,
    "hs1.8xlarge": 2048,
    "i2.xlarge": 800,
    "i2.2xlarge": 800,
    "i2.4xlarge": 800,
    "i2.8xlarge": 800,
    "m1.small": 60 ,
    "m1.medium": 410,
    "m1.large": 420,
    "m1.xlarge": 420,
    "m2.xlarge": 420,
    "m2.2xlarge": 850,
    "m2.4xlarge": 840,
    "m3.medium": 4,
    "m3.large": 32,
    "m3.xlarge": 40,
    "m3.2xlarge": 80,
    "r3.large": 32,
    "r3.xlarge": 80,
    "r3.2xlarge": 160,
    "r3.4xlarge": 320,
    "r3.8xlarge": 320,
    "t1.micro": 0,
    "t2.micro": 0,
    "t2.small": 0,
    "t2.medium": 0
};

module.exports = function requestSpotInstance(ec2, spec, callback) {
    console.log("[1] Requesting spot instance.");

    var size = SIZE_MAP[spec.type];
    if (!size) {
        return callback(new Error("Don't know how to add a instance storage (empheral disc) to a " + spec.type + " instance."));
    }
    var specification = {
        SpotPrice: '' + spec.bidding,
        InstanceCount: 1,
        LaunchSpecification: {
            ImageId: spec.ami,
            InstanceType: spec.type,
            KeyName: spec.key,
            Monitoring: {
                Enabled: false
            },
            BlockDeviceMappings: [{
                DeviceName: "/dev/sda1",
                Ebs: {
                    VolumeSize: size,
                    DeleteOnTermination: true
                }
            }],
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
    };

    ec2.requestSpotInstances(specification, function (error, requests) {
        if (error) {
            return callback(error);
        }
        console.log("... created " + requests.SpotInstanceRequests[0].SpotInstanceRequestId);
        callback(null, requests.SpotInstanceRequests[0]);
    });
};