/* global E */

var net = require('net');

function createConnection (nano, address, port) {
	var connection = net.connect({
		'host': address,
		'port': port,
	}, nano.connect.bind(nano));
	
	var parse = function (message) {
		var data = E.toUint8Array(message);
		nano.parse(data);
	};
	var write = function (data) {
		var message = E.toString(data);
		connection.write(message);
	};
	
	connection.on('data', parse);
	nano.on('data', write);
	
	connection.on('end', function onClose () {
		connection.removeListener('data', parse);
		nano.removeListener('data', write);
	});
	
	return connection;
}

module.exports = function espruinoTcpAdapter (nano, address, port, timeout, retry) {
	function setupConnection () {
		try {
			var connection = createConnection(nano, address, port);
			
			var closeConnection = connection.end.bind(connection);
			var removeTimeout = clearTimeout.bind(void 0, setTimeout(closeConnection, timeout || 10000));
			
			nano.on('connected', removeTimeout);
			connection.on('end', function onConnectionClosed () {
				nano.removeListener('connected', removeTimeout);
				nano.setConnected(false);
				setTimeout(setupConnection, retry || 5000);
			});
		}
		catch (err) {
			setTimeout(setupConnection, retry || 5000);
		}
	}
	
	setupConnection();
	
	return nano;
};
