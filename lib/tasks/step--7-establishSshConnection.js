"use strict";

var Connection = require('ssh2');

module.exports = function (access, requestAndInstance, callback) {
    console.log("[7] Establishing SSH connection to the server");
    var details = {
            host: requestAndInstance.instance.PublicIpAddress,
            username: access.user,
            privateKey: access.privateKey
        };
    function tryToConnect() {
        var conn = new Connection(),
            wasReady = false;
        conn.on('ready', function () {
            wasReady = true;
            requestAndInstance.ssh = conn;
            callback(null, requestAndInstance);
        });
        conn.on('error', function (error) {
            if (!wasReady) {
                console.log("... error when trying to connect (" + error + ") retrying to connect in 2s.");
                setTimeout(tryToConnect, 2000);
            }
        });
        conn.connect(details);   
    }
    tryToConnect();
};
