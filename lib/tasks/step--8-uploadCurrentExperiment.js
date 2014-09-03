"use strict";

var glob = require("glob"),
    async = require("async"),
    path = require("path"),
    fs = require("fs");

function log(msg) {
    return function (callback) {
        console.log(msg);
        callback();
    }
}

function mkdirp(sftp, folder, callback) {
    function makeFolder(error) {
        if (error) {
            return callback(error);
        }
        sftp.stat(folder, function (error, stats) {
            if (error) {
                console.log("... preparing folder " + folder);
                return sftp.mkdir(folder, callback);
            }
            if (stats.isDirectory()) {
                callback();
            } else {
                callback("Error '" + folder + "' exists but isn't a directory. (file?: " + stats.isFile() + ") " + stats);
            }
        });
    }

    var parent = path.dirname(folder);
    if (folder === ".") {
        callback();
    } else if (parent !== "/" ) {
        mkdirp(sftp, parent, makeFolder);
    } else {
        makeFolder();
    }
}

module.exports = function (requestAndInstanceAndSsh, callback) {
    console.log("[8] Experiment-server is active, uploading experiment now to", requestAndInstanceAndSsh.instance.PublicIpAddress);
    var conn = requestAndInstanceAndSsh.ssh;
    console.log("... establishing connection");
    conn.sftp(function(error, sftp) {
        if (error) {
            return callback(error);
        }
        console.log("... we've got sftp");
        var base = "./",
            remoteBase =  '/tmp/experiment',
            content = glob.sync(base + '**/*'),
            folders = {};

        content.forEach(function (file) {
            var relative = path.relative(base, file),
                folder = path.dirname(path.resolve(remoteBase, relative));
            folders[folder] = true;
        });

        async.series([
            async.mapSeries.bind(null, Object.keys(folders), mkdirp.bind(null, sftp)),
            log("open dir " + remoteBase),
            async.mapSeries.bind(null, content, function (file, callback) {
                var relative = path.relative(base, file);
                if (!fs.statSync(file).isFile()) {
                    process.stdout.write("... uploading '" + file + "' ");
                    sftp.fastPut(file, path.resolve(remoteBase, relative), {
                        step: function (total_transferred, chunk, total) {
                            process.stdout.write(".");
                        }
                    }, function (error) {
                        if (error) {
                            process.stdout.write("\n");
                            return callback(error);
                        }
                        process.stdout.write(" done.\n");
                        callback();
                    });
                } else {
                    console.log("... skipping '" + file + "' because its no file");
                    callback();
                }
            })
        ], function (error) {
            if (error) {
                return callback(error);
            }
            callback(null, requestAndInstanceAndSsh);
        });
    });
};