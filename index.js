var config = require('./config/config');
var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var winston = require('winston');

var qrsInteract = function QRSInteract(hostname) {
    var defaultPort = 4242;
    var basePath = "https://" + hostname + ":" + defaultPort + "/qrs";
    var xrfkey = "xrfkey=ABCDEFG123456789";
    var defaults = request.defaults({
        rejectUnauthorized: false,
        host: hostname,
        cert: fs.readFileSync(config.certificates.client),
        key: fs.readFileSync(config.certificates.client_key),
        ca: fs.readFileSync(config.certificates.root),
        headers: {
            'X-Qlik-User': config.repoAccount,
            'X-Qlik-Xrfkey': 'ABCDEFG123456789',
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip'
        },
        gzip: true,
        json: true
    });

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }

    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
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
            newPath += '?' + xrfkey;
        } else {
            newPath += '&' + xrfkey;
        }

        return newPath;
    }

    this.Get = function(path) {
        return new Promise(function(resolve, reject) {
            path = getFullPath(path);
            var sCode;
            var r = defaults;
            var res = '';
            r.get(path)
                .on('response', function(response, body) {
                    sCode = response.statusCode;
                })
                .on('data', function(chunk) {

                    if (sCode == 200) {
                        res += chunk;
                    } else {
                        reject("Received error code: " + sCode);
                    }
                })
                .on('error', function(error) {

                })
                .on('end', function() {
                    resolve(JSON.parse(res));
                });

        });
    };

    this.Post = function(path, body, sendType) {
        return new Promise(function(resolve, reject) {
            path = getFullPath(path);
            var sCode;
            var r = defaults;
            var res = '';
            var finalBody = body != undefined ? (sendType.toLowerCase() == 'json' ? body : JSON.stringify(body)) : undefined;
            r({
                    url: path,
                    method: 'POST',
                    body: finalBody
                })
                .on('response', function(response, body) {
                    sCode = response.statusCode;
                })
                .on('error', function(err) {

                })
                .on('data', function(data) {
                    if (sCode == 200 || sCode == 201) {
                        res += data;
                    } else {
                        reject("Received error code: " + sCode + '::' + data);
                    }
                })
                .on('end', function() {
                    resolve(JSON.parse(res));
                });
        });
    };

    this.Put = function(path, body) {
        return new Promise(function(resolve, reject) {
            path = getFullPath(path);
            var sCode;
            var r = defaults;
            r({
                    url: path,
                    method: 'PUT',
                    body: body
                })
                .on('response', function(response, body) {
                    sCode = response.statusCode;
                    if (sCode == 204) {
                        resolve(sCode);
                    } else {
                        reject(sCode)
                    }
                })
                .on('error', function(err) {

                });
        })
    };

    this.Delete = function(path) {
        return new Promise(function(resolve, reject) {
            path = getFullPath(path);
            var sCode;
            var r = defaults;

            r({
                    url: path,
                    method: 'DELETE'
                })
                .on('response', function(response) {
                    sCode = response.statusCode;

                    if (sCode == 204) {
                        resolve(sCode);
                    } else {
                        reject("Received error code: " + sCode);
                    }
                })
                .on('error', function(error) {

                });
        });
    };
};

module.exports = qrsInteract;