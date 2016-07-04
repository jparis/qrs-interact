var path = require('path');
var extend = require('extend');

var config = extend(true, {
	hostname: '',
	portNumber: 4242,
	localCertPath: 'C:/ProgramData/Qlik/Sense/Repository/Exported Certificates/.Local Certificates',
	repoAccount: 'UserDirectory=Internal;UserId=sa_repository',
	repoAccountUserDirectory: 'INTERNAL',
	repoAccountUserId: 'sa_repository',
	certificates: {
		client: path.resolve(localCertPath, 'client.pem'),
		client_key: path.resolve(localCertPath, 'client_key.pem'),
		server: path.resolve(localCertPath, 'server.pem'),
		server_key: path.resolve(localCertPath, 'server_key.pem'),
		root: path.resolve(localCertPath, 'root.pem')
	}
});

module.exports = config;