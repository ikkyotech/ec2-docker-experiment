"use strict";

var exec = require("./util/exec"),
    async = require("async");

module.exports = function (version, s3, bucketInfo, requestAndInstanceAndSsh, callback) {
    console.log("[11] Uploading output to s3");
    var commands = [
            "cd /tmp/out && tar -zcvf /tmp/out.tar.gz .",
            "stat -c%s /tmp/out.tar.gz"
        ],
        conn = requestAndInstanceAndSsh.ssh;
    async.mapSeries(commands, exec.bind(null, conn), function (error, results) {
        if (error) {
            console.log("Error occured while preparing output tar file: " + error);
            return callback(null, requestAndInstanceAndSsh);
        }
        var size = results[1];
        exec(conn, s3.putObject(bucketInfo.bucket, bucketInfo.prefix + version + "_out.tar.gz", "/tmp/out.tar.gz", results[1]), function () {
            if (error) {
                console.log("Error occured while uploading output: " + error);
            }
            callback(null, requestAndInstanceAndSsh);
        });
    });
};