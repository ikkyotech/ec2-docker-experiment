"use strict";

var async = require("async"),
    exec = require("./util/exec"),
    fs = require("fs");

function importsFromString(input) {
    var result = "";
    input.split("\n").forEach(function (line) {
        if (line !== "") {
            var params = /\s*([^:]*)(\s*\:\s*(.*))?\s*$/.exec(line),
                source = params[1],
                target = params[3] || source;
            result += "-v " + source + ":" + target + " ";       
        }
    });
    return result;
}

function importsFromFile() {
    var filePath = "./docker.import";
    if (fs.existsSync(filePath)) {
        return importsFromString(fs.readFileSync(filePath).toString())
    }
    return "";
}

function importsFromObject(imports) {
    var result = "";
    Object.keys(imports).forEach(function (source) {
        var target = imports[source];
        if (target === 1 || target === "" || target === true || target === false) {
            target = source;
        }
        result += "-v " + source + ":" + target + " ";
    });
    return result;
}

function stringifyImports(imports) {
    if (typeof imports === "object") {
        return importsFromObject(imports);
    } else if (typeof imports === "string") {
        return importsFromString(imports);
    }
    throw new Error("No idea how to parse imports from '" + imports + "'");
}

module.exports = function (imports, requestAndInstanceAndSsh, callback) {
    console.log("[10] Setting up and starting experiment", requestAndInstanceAndSsh.instance.PublicIpAddress);
    var conn = requestAndInstanceAndSsh.ssh;
    
    async.mapSeries([
        "sudo docker build --tag=experiment /tmp/experiment",
        "sudo docker run --interactive=false --privileged -v /tmp/in:/in -v /tmp/out:/out " + stringifyImports(imports) + "experiment"
    ], exec.bind(null, conn), function (error) {
        console.log("");
        if (error) {
            console.log("Error occured while running the experiment: " + error);
        }
        callback(null, requestAndInstanceAndSsh);
    });
};