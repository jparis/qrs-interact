var common = require('./common');
var https = require('https');
var Promise = require('bluebird');

var qrsInteract = function QRSInteractMain(hostname, portNumber, virtualProxyPrefix, xrfkeyParam, requestDefaultParams) {
    common.initStringHelpers();

    var generateBasePath = function(virtualProxy) {
        var newVirtualProxy = virtualProxy;
        if (newVirtualProxy == undefined) {
            newVirtualProxy = "";
        }
        if (newVirtualProxy != "") {
            if (!newVirtualProxy.startsWith('/')) {
                newVirtualProxy = '/' + newVirtualProxy;
            }

            if (newVirtualProxy.endsWith('/')) {
                newVirtualProxy = newVirtualProxy.substr(0, newVirtualProxy.length - 1);
            }
        }

        return (newVirtualProxy == "" ? "" : newVirtualProxy) + "/qrs";
    }

    var getFullPath = function(path) {
        var newPath = basePath;
        if (!path.startsWith('/')) {
            newPath += '/';
        }
        newPath += path;
        if (newPath.endsWith('/')) {
            newPath = newPath.substr(0, newPath.length - 1);
        }

        var indexOfSlash = newPath.lastIndexOf('/');
        var indexOfQuery = newPath.lastIndexOf('?');
        if (indexOfQuery <= indexOfSlash) {
            newPath += '?' + xrfkeyParam;
        } else {
            var stringToEncode = newPath.substr(indexOfQuery + 1);
            newPath = newPath.substring(0, indexOfQuery + 1);
            if (stringToEncode == decodeURI(stringToEncode)) {
                stringToEncode = encodeURI(stringToEncode);
            }
            newPath = newPath + stringToEncode;
            newPath += '&' + xrfkeyParam;
        }

        return newPath;
    }

    var basePath = generateBasePath(virtualProxyPrefix);

    this.UseCookie = function(userCookie) {
        requestDefaultParams.headers.Cookie = userCookie;
        delete requestDefaultParams.headers['X-Qlik-User'];
    };

    this.UpdateVirtualProxyPrefix = function(vProxyPrefix) {
        virtualProxyPrefix = vProxyPrefix;
        basePath = generateBasePath(virtualProxyPrefix);
    }

    this.UpdateHostname = function(newHostname) {
        hostname = newHostname;
        basePath = generateBasePath(virtualProxyPrefix);
    }

    this.Get = function(path) {
        return new Promise(function(resolve, reject) {
            var r = requestDefaultParams;
            var isApp = false;
            path = getFullPath(path);
            if (path.startsWith('/qrs/tempcontent/')) {
                path = path.substr(4);
                r.headers['Accept-Encoding'] = 'gzip';
                isApp = true;
            }
            r['method'] = 'GET';
            r['path'] = path;
            var req = https.request(r, (res) => {
                var responseString = "";
                var bufferResponse;
                if (isApp) {
                    bufferResponse = Buffer.alloc(0);
                }
                var statusCode = res.statusCode;
                res.on('error', function(err) {
                    reject("QRS response error:" + err);
                });
                res.on('data', function(data) {
                    if (!isApp) {
                        responseString += data;
                    } else {
                        bufferResponse = Buffer.concat([bufferResponse, data]);

                    }
                });
                res.on('end', function() {
                    if (statusCode == 200) {
                        var jsonResponse = "";
                        if (!isApp) {
                            jsonResponse = JSON.parse(responseString);
                            resolve({
                                "statusCode": statusCode,
                                "body": jsonResponse
                            });
                        } else {
                            resolve({
                                "statusCode": statusCode,
                                "body": bufferResponse
                            });
                        }
                    } else {
                        reject("Received error code: " + statusCode + '::' + responseString);
                    }
                });
            }).on('error', function(err) {
                reject("QRS request error:" + err);
            });

            req.end();
        });
    };

    this.Post = function(path, body, sendType) {
        return new Promise(function(resolve, reject) {
            var r = requestDefaultParams;
            var finalBody;
            path = getFullPath(path);
            r['method'] = 'POST';
            r['path'] = path;
            if (sendType == undefined) {
                sendType = "";
            }
            if (body == undefined || body == "") {
                finalBody = "";
            } else if (sendType.toLowerCase() == 'json' || sendType.toLowerCase() == 'application/json') {
                finalBody = JSON.stringify(body);
            } else if (sendType == "") {
                finalBody = body;
            } else {
                r.headers['Content-Type'] = sendType;
                finalBody = body;
            }

            var req = https.request(r, (res) => {
                var responseString = "";
                var statusCode = res.statusCode;
                res.on('error', function(err) {
                    reject("QRS response error:" + err);
                });
                res.on('data', function(data) {
                    responseString += data;
                });
                res.on('end', function() {
                    if (statusCode == 200 || statusCode == 201 || statusCode == 204) {
                        var jsonResponse = "";
                        if (responseString.length != 0) {
                            try {
                                jsonResponse = JSON.parse(responseString);
                            } catch (e) {
                                resolve({
                                    "statusCode": statusCode,
                                    "body": responseString
                                });
                            }
                        }
                        resolve({
                            "statusCode": statusCode,
                            "body": jsonResponse
                        });
                    } else {
                        reject("Received error code: " + statusCode + '::' + responseString);
                    }
                });
            }).on('error', function(err) {
                reject("QRS request error:" + err);
            });
            req.write(finalBody);
            req.end();
        });
    };

    this.Put = function(path, body) {
        return new Promise(function(resolve, reject) {
            var r = requestDefaultParams;
            var finalBody = JSON.stringify(body);
            path = getFullPath(path);
            r['method'] = 'PUT';
            r['path'] = path;

            var req = https.request(r, (res) => {
                var responseString = "";
                var statusCode = res.statusCode;

                res.on('error', function(err) {
                    reject("QRS response error:" + err);
                });
                res.on('data', function(data) {
                    responseString += data;
                });
                res.on('end', function() {
                    if (statusCode == 200 || statusCode == 204) {
                        var jsonResponse = "";
                        if (responseString.length != 0) {
                            try {
                                jsonResponse = JSON.parse(responseString);
                            } catch (e) {
                                resolve({
                                    "statusCode": statusCode,
                                    "body": responseString
                                });
                            }
                        }
                        resolve({
                            "statusCode": statusCode,
                            "body": jsonResponse
                        });
                    } else {
                        reject("Received error code: " + statusCode + '::' + bufferResponse);
                    }
                });
            }).on('error', function(err) {
                reject("QRS request error:" + err);
            });
            req.write(finalBody);
            req.end();
        });
    };

    this.Delete = function(path) {
        return new Promise(function(resolve, reject) {
            var r = requestDefaultParams;
            path = getFullPath(path);
            r['method'] = 'DELETE';
            r['path'] = path;

            var req = https.request(r, (res) => {
                var statusCode = res.statusCode;
                res.on('end', function() {
                        if (statusCode == 204) {
                            resolve(statusCode);
                        } else {
                            reject("Received error code: " + statusCode);
                        }
                    })
                    .on('error', function(err) {
                        reject("QRS response error:" + err);
                    });
            }).on('error', function(err) {
                reject("QRS request error:" + err);
            });
        });
    };

    this.GetBasePath = function() {
        return "https://" + hostname + ":" + portNumber + '/' + basePath;
    }
};

module.exports = qrsInteract;