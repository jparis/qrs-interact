var common = require('./common');
var Promise = require('bluebird');
var request = require('request');

var qrsInteract = function QRSInteractMain(hostname, portNumber, virtualProxyPrefix, xrfkeyParam, requestDefaultParams) {
    common.initStringHelpers();

    var generateBasePath = function (host, port, virtualProxy) {
        var newVirtualProxy = virtualProxy;
        if (newVirtualProxy == undefined)
        {
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

        var newHost = host;
        if (newHost.endsWith('/')) {
            newHost = newHost.substr(0, newHost.length - 1);
        }

        return (newHost.startsWith('http') ? newHost : "https://" + newHost) +
            (port == "" ? "" : (newVirtualProxy != "" ? "" : (requestDefaultParams.headers['X-Qlik-User'] == undefined ? "" : ":" + port))) +
            (newVirtualProxy == "" ? "" : newVirtualProxy) +
            "/qrs";
    }

    var getFullPath = function (path) {
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
            newPath += '&' + xrfkeyParam;
        }

        return newPath;
    }

    var basePath = generateBasePath(hostname, portNumber, virtualProxyPrefix);
    var requestDefaults = request.defaults(requestDefaultParams);

    this.UseCookie = function (userCookie) {
        requestDefaultParams.headers.Cookie = userCookie;
        delete requestDefaultParams.headers['X-Qlik-User'];
        requestDefaults = request.defaults(requestDefaultParams);
    };

    this.UpdateVirtualProxyPrefix = function (vProxyPrefix) {
        basePath = generateBasePath(hostname, portNumber, vProxyPrefix);
    }

    this.Get = function (path) {
        return new Promise(function (resolve, reject) {
            path = getFullPath(path);
            var statusCode;
            var bufferResponse = new Buffer(0);
            var r = requestDefaults;
            r.get(path)
                .on('response', function (response, body) {
                    statusCode = response.statusCode;
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('data', function (data) {
                    bufferResponse = Buffer.concat([bufferResponse, data]);
                })
                .on('end', function () {
                    if (statusCode == 200) {
                        var jsonResponse = "";
                        if (bufferResponse.length != 0) {
                            try {
                                jsonResponse = JSON.parse(bufferResponse);
                            } catch (e) {
                                resolve({
                                    "statusCode": statusCode,
                                    "body": bufferResponse
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

        });
    };

    this.Post = function (path, body, sendType) {
        return new Promise(function (resolve, reject) {
            path = getFullPath(path);
            var statusCode;
            var bufferResponse = new Buffer(0);
            var r = requestDefaults;
            var postRequest;
            if (sendType == undefined)
            {
                sendType = "";
            }
            if (sendType.toLowerCase() == 'vnd.qlik.sense.app') {
                r = r.defaults({
                    headers: {
                        'Content-Type': 'application/vnd.qlik.sense.app'
                    }
                });
                postRequest = body.pipe(r({
                    url: path,
                    method: 'POST'
                }));

            } else {
                var finalBody = body != undefined ? (sendType.toLowerCase() == 'json' ? body : JSON.stringify(body)) : undefined;
                postRequest = r({
                    url: path,
                    method: 'POST',
                    body: finalBody
                });
            }

            postRequest
                .on('response', function (response, body) {
                    statusCode = response.statusCode;
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('data', function (data) {
                    bufferResponse = Buffer.concat([bufferResponse, data]);
                })
                .on('end', function () {
                    if (statusCode == 200 || statusCode == 201) {
                        var jsonResponse = "";
                        if (bufferResponse.length != 0) {
                            try {
                                jsonResponse = JSON.parse(bufferResponse);
                            } catch (e) {
                                resolve({
                                    "statusCode": statusCode,
                                    "body": bufferResponse
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
        });
    };

    this.Put = function (path, body) {
        return new Promise(function (resolve, reject) {
            path = getFullPath(path);
            var statusCode;
            var bufferResponse = new Buffer(0);
            var r = requestDefaults;
            r({
                    url: path,
                    method: 'PUT',
                    body: body
                })
                .on('response', function (response, body) {
                    statusCode = response.statusCode;
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('data', function (data) {
                    bufferResponse = Buffer.concat([bufferResponse, data]);
                })
                .on('end', function () {
                    if (statusCode == 200 || statusCode == 204) {
                        var jsonResponse = "";
                        if (bufferResponse.length != 0) {
                            try {
                                jsonResponse = JSON.parse(bufferResponse);
                            } catch (e) {
                                resolve({
                                    "statusCode": statusCode,
                                    "body": bufferResponse
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
        })
    };

    this.Delete = function (path) {
        return new Promise(function (resolve, reject) {
            path = getFullPath(path);
            var statusCode;
            var r = requestDefaults;
            r({
                    url: path,
                    method: 'DELETE'
                })
                .on('response', function (response) {
                    statusCode = response.statusCode;

                    if (statusCode == 204) {
                        resolve(statusCode);
                    } else {
                        reject("Received error code: " + statusCode);
                    }
                })
                .on('error', function (err) {
                    reject(err);
                });
        });
    };

    this.GetBasePath = function () {
        return basePath;
    }
};

module.exports = qrsInteract;