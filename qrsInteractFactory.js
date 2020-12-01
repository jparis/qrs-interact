var common = require('./common');
var config = require('./config/config');
var extend = require('extend');
var fs = require('fs');
var path = require('path');
var qrsInteractMain = require('./qrsInteract');


var qrsInteract = function QRSInteract(inputConfig) {
    common.initStringHelpers();

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

    var defaultHeaders;
    if (localConfig['headers'] == null) {
        var defaultHeaders = {
            'X-Qlik-User': localConfig.repoAccount,
            'Content-Type': 'application/json',
        };
    } else {
        var defaultHeaders = localConfig['headers'];
    }

    defaultHeaders = extend(true, defaultHeaders, {
        'X-Qlik-Xrfkey': xrfkey
    });

    var requestDefaultParams;
    if (localConfig['certificates']['certFile'] != null && localConfig['certificates']['keyFile'] != null) {
        requestDefaultParams = {
            method: '',
            path: '',
            rejectUnauthorized: false,
            host: localConfig.hostname,
            port: localConfig.portNumber,
            cert: fs.readFileSync(localConfig.certificates.certFile),
            key: fs.readFileSync(localConfig.certificates.keyFile),
            headers: defaultHeaders,
            gzip: true,
            json: true
        };
    } else if (localConfig['certificates']['pfxFile'] != null && localConfig['certificates']['passphrase'] != null) {
        requestDefaultParams = {
            method: '',
            path: '',
            rejectUnauthorized: false,
            host: localConfig.hostname,
            port: localConfig.portNumber,
            pfx: fs.readFileSync(localConfig.certificates.pfxFile),
            headers: defaultHeaders,
            gzip: true,
            json: true,
            passphrase: localConfig.certificates.passphrase
        };
    } else if (defaultHeaders['Authorization'] && defaultHeaders['Authorization'].match(/^Bearer .*$/)) {
        requestDefaultParams = {
            method: '',
            path: '',
            rejectUnauthorized: false,
            host: localConfig.hostname,
            port: localConfig.portNumber,
            headers: defaultHeaders,
            gzip: true,
            json: true
        };
    } else {
        throw "Please use 'certFile' and 'keyFile' OR 'pfxFile' and 'passphrase' in your config for setting up your certificates.";
    }

    if (localConfig['minTlsVersion'] != null) {
        requestDefaultParams.minVersion = localConfig.minTlsVersion;
    }
    if (localConfig['maxTlsVersion'] != null) {
        requestDefaultParams.maxVersion = localConfig.maxTlsVersion;
    }
    if (localConfig['honorCipherOrder'] != null) {
        requestDefaultParams.honorCipherOrder = localConfig.honorCipherOrder;
    }
    if (localConfig['ciphers'] != null) {
        requestDefaultParams.ciphers = localConfig.ciphers;
    }

    var qrsInteractInstance = new qrsInteractMain(localConfig.hostname, localConfig.portNumber, localConfig.virtualProxyPrefix, xrfkeyParam, requestDefaultParams);
    return qrsInteractInstance;
}

module.exports = qrsInteract;