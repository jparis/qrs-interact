var qrsInteract = require('./qrsInteract');
var request = require('request');

var qrsInteract = function QRSInteract(inputConfig) {

    var updateConfig = function(inputConfig)
    {
        var newConfig = common.clone(config);
        if (typeof inputConfig == 'string')
        {
            newConfig.hostname = inputConfig;
        }
        else
        {
            newConfig = extend(true, newConfig, inputConfig);
        }
        
        newConfig = extend(true, newConfig, {
            certificates: {
		        client: path.resolve(newConfig.localCertPath, 'client.pem'),
		        client_key: path.resolve(newConfig.localCertPath, 'client_key.pem'),
		        server: path.resolve(newConfig.localCertPath, 'server.pem'),
		        server_key: path.resolve(newConfig.localCertPath, 'server_key.pem'),
		        root: path.resolve(newConfig.localCertPath, 'root.pem')
            }
        });

        return newConfig;
    }

    var generateXrfKey = function() {
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
    var xrfkeyParam = "xrfkey="+xrfkey;
    var basePath = "https://" + localConfig.hostname + ":" + localConfig.portNumber + "/qrs";

    var defaults = request.defaults({
        rejectUnauthorized: false,
        host: localConfig.hostname,
        cert: fs.readFileSync(localConfig.certificates.client),
        key: fs.readFileSync(localConfig.certificates.client_key),
        ca: fs.readFileSync(localConfig.certificates.root),
        headers: {
            'X-Qlik-User': localConfig.repoAccount,
            'X-Qlik-Xrfkey': xrfkey,
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip'
        },
        gzip: true,
        json: true
    });


    var qrsInteractInstance = QRSInteractMain(basePath, xrfkeyParam, defaults);

    return qrsInteractInstance;
}

module.exports = qrsInteract;