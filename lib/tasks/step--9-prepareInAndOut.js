"use strict";

var exec = require("./util/exec"),
    async = require("async"),
    awsSdk;

module.exports = function (s3, bucketInfo, requestAndInstanceAndSsh, callback) {
    console.log("[9] Preparing the input and output folders");
    var commands = [
        "mkdir -p /tmp/in",
        "mkdir -p /tmp/out",
        "rm -r -f /tmp/in/*", // cleaning eventually created former input directory
        "rm -r -f /tmp/out/*",
    ];
    if (bucketInfo) {
        commands = commands.concat(
            s3.getObject(bucketInfo.bucket, bucketInfo.file, "/tmp/in.tar.gz"),
            "tar -xzvf /tmp/in.tar.gz -C /tmp/in"
        )
    }
    async.mapSeries(commands, exec.bind(null, requestAndInstanceAndSsh.ssh), function (error) {
        if (error) {
            console.log("Error occured while downloading from s3: " + error);
        }
        callback(null, requestAndInstanceAndSsh);
    });
};