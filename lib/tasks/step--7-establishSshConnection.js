"use strict";

var Connection = require('ssh2');

module.exports = function (access, requestAndInstance, callback) {
    console.log("[7] Establishing SSH connection to the server");
    var tries = 0,
        maxTries = 40;
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
                if (tries < maxTries) {
                    tries++;
                    console.log("... error when trying to connect (" + error + ") retrying to connect in 2s (" + tries + "/" + maxTries + ")");
                    setTimeout(tryToConnect, 2000);
                } else {
                    callback(error);   
                }
            }
        });
        conn.connect({
            host: requestAndInstance.instance.PublicIpAddress,
            username: access.user,
            privateKey: access.privateKey
        });   
    }
    tryToConnect();
};