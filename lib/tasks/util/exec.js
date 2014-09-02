"use strict";

module.exports = function exec(conn, cmd, callback) {
    var cwd,
        ignoreErrors = false;
    if (typeof cmd === "object") {
        cwd = cmd.cwd;
        ignoreErrors = cmd.ignoreErrors;
        cmd = cmd.cmd;
        if (cwd) {
            console.log(cmd.cwd + "$ " + cmd.cmd);
            cmd = "cd " + cwd + " && " + cmd;
        } else {
            console.log("$ " + cmd);
        }
    } else {
        console.log("$ " + cmd);
    }
    conn.exec(cmd, {
       pty: true
    }, function (error, stream) {
        if (error) {
            return callback(error);
        }
        
        var error,
            allOut = "";
        stream.on('exit', function(code, signal) {
            if (code !== 0 && !ignoreErrors) {
                 error = new Error("Error while executing the code: " + code);
            }
        }).on('close', function() {
            callback(error, allOut.substr(0, allOut.length-2));
        }).on('data', function(data) {
            allOut += data;
            process.stdout.write(data);
        });
    });
};
