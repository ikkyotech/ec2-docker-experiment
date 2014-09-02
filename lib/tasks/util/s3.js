"use strict";

module.exports = function (AWS, credentials) {
    function createRequest(bucket, key) {
        return {
            path: "/" + bucket + "/" + key,
            headers: {
                "Host": "s3.amazonaws.com",
                "Accept": "*/*"
            }
        };
    }

    function sign(request) {
        new AWS.Signers.S3(request).addAuthorization({
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretKey
        });
    }

    function chainHeaders(request) {
        var headers = "";
        Object.keys(request.headers).forEach(function (key) {
            if (key != "Host" && key != "Accept") {
                headers += "-H \"" + key + ": " + request.headers[key].replace(/\"/, "\\\"") + "\" "   
            }
        });
        return headers;
    }

    function createBasicRequest(request, options) {
        sign(request);
        return "curl -L -H \"User-Agent:\" " + chainHeaders(request) + options + "https://" + request.headers.Host + request.path;
    }

    return {
        getObject: function (bucket, key, target) {
            var request = createRequest(bucket, key);
            request.headers["Content-Length"] = "0";
            request.method = "GET";
            return createBasicRequest(request, "") + " > " + target;
        },
        putObject: function (bucket, key, source, size) {
            var request = createRequest(bucket, key);
            request.headers["Content-Length"] = size;
            request.method = "PUT";
            return createBasicRequest(request, "-T \"" + source + "\" ");
        }
    }
}