var common = require('./common');
var config = require('./config/config');
var extend = require('extend');
var fs = require('fs');
var path = require('path');
var qrsInteractMain = require('./qrsInteract');
var request = require('request');

var qrsInteract = function QRSInteract(inputConfig) {

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

    var updateConfig = function (inputConfig) {
        var newConfig = common.clone(config);
        if (typeof inputConfig == 'string') {
            newConfig.hostname = inputConfig;
        } else {
            newConfig = extend(true, newConfig, inputConfig);
        }

        if (newConfig['certificates'] == null) {
            newConfig = extend(true, newConfig, {
                certificates: {
                    certFile: path.resolve(newConfig.localCertPath, 'client.pem'),
                    keyFile: path.resolve(newConfig.localCertPath, 'client_key.pem')
                }
            });
        }

        if (newConfig.virtualProxyPrefix != "" && !newConfig.virtualProxyPrefix.startsWith('/'))
        {
            newConfig.virtualProxyPrefix = '/' + newConfig.virtualProxyPrefix;
        }

        if (newConfig.virtualProxyPrefix != "" && newConfig.virtualProxyPrefix.endsWith('/'))
        {
            newConfig.virtualProxyPrefix = newConfig.virtualProxyPrefix.substr(0, newConfig.virtualProxyPrefix.length-1);
        }

        return newConfig;
    }

    var generateXrfKey = function () {
        var xrfString = "";
        for (i = 0; i < 16; i++) {
            if (Math.floor(Math.random() * 2) == 0) {
                xrfString += Math.floor(Math.random() * 10).toString();
            } else {
                var charNumber = Math.floor(Math.random() * 26);
                if (Math.floor(Math.random() * 2) == 0) {
                    //small letter
                    xrfString += String.fromCharCode(charNumber + 97);
                } else {
                    xrfString += String.fromCharCode(charNumber + 65);
                }
            }
        }
        return xrfString;
    }

    var localConfig = updateConfig(inputConfig);
    var xrfkey = generateXrfKey();
    var xrfkeyParam = "xrfkey=" + xrfkey;
    var basePath = "https://" +
        localConfig.hostname +
        (localConfig.portNumber == "" ? "" : ":" + localConfig.portNumber) +
        (localConfig.virtualProxyPrefix == "" ? "" : "/" + localConfig.virtualProxyPrefix) +
        "/qrs";

    var defaultHeaders;
    if (localConfig['headers'] == null) {
        var defaultHeaders = {
            'X-Qlik-User': localConfig.repoAccount,
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip'
        };
    } else {
        var defaultHeaders = localConfig['headers'];
    }

    defaultHeaders = extend(true, defaultHeaders, {
        'X-Qlik-Xrfkey': xrfkey
    });

    var requestDefaults;
    if (localConfig['certificates']['certFile'] != null && localConfig['certificates']['keyFile'] != null) {
        requestDefaults = request.defaults({
            rejectUnauthorized: false,
            host: localConfig.hostname,
            cert: fs.readFileSync(localConfig.certificates.certFile),
            key: fs.readFileSync(localConfig.certificates.keyFile),
            headers: defaultHeaders,
            gzip: true,
            json: true
        });
    } else if (localConfig['certificates']['pfxFile'] != null && localConfig['certificates']['passphrase'] != null) {
        requestDefaults = request.defaults({
            rejectUnauthorized: false,
            host: localConfig.hostname,
            pfx: fs.readFileSync(localConfig.certificates.pfxFile),
            headers: defaultHeaders,
            gzip: true,
            json: true,
            passphrase: localConfig.certificates.passphrase
        });
    } else {
        throw "Please use 'certFile' and 'keyFile' OR 'pfxFile' and 'passphrase' in your config for setting up your certificates.";
    }

    var qrsInteractInstance = new qrsInteractMain(basePath, xrfkeyParam, requestDefaults);
    return qrsInteractInstance;
}

module.exports = qrsInteract;