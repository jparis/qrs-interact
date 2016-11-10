var Promise = require('bluebird');
var request = require('request');

var qrsInteract = function QRSInteractMain(basePath, xrfkeyParam, requestDefaults) {

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }

    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
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

    this.UpdateCookie = function(userCookie)
    {
        requestDefaults.headers.Cookie = cookieToString(userCookie);
        delete requestDefaults.headers['X-Qlik-User'];
    };

    this.UpdateBasePath = function(vProxyPrefix)
    {
        basePath = "https://" + requestDefaults.host + (vProxyPrefix.length==0 ? "" : "/" + vProxyPrefix) + "/qrs" ;
    }

    this.Get = function (path) {
        return new Promise(function (resolve, reject) {
            path = getFullPath(path);
            var statusCode;
            var bufferResponse = new Buffer(0);
            var r = request.defaults(requestDefaults);
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
            var r = request.defaults(requestDefaults);
            var finalBody = body != undefined ? (sendType.toLowerCase() == 'json' ? body : JSON.stringify(body)) : undefined;
            r({
                    url: path,
                    method: 'POST',
                    body: finalBody
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
            var r = request.defaults(requestDefaults);
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
            var r = request.defaults(requestDefaults);
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

function cookieToString(objCookie)
{
    var result ="";
    for(var key in objCookie)
    {
        result += key + "=" + objCookie[key] + ";"
    }
    return result;
}