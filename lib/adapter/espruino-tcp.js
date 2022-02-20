/* global E */

var net = require('net');

var noop = function () {};

function createConnection (nano, address, port, timeout, onConnectionClosed) {
	var connection = net.connect({
		'host': address,
		'port': port,
	}, function emitConnect () {
		connection.emit('connected');
	});
	
	var timer = setTimeout(connection.end.bind(connection), timeout);
	
	var parse = function (message) {
		var data = E.toUint8Array(message);
		nano.parse(data);
	};
	var write = function (data, type) {
		var message = E.toString(data);
		connection.write(message, function onSent () {
			if (type === nano.DISCONNECT) {
				connection.end();
			}
		});
	};
	var onConnect = function () {
		clearTimeout(timer);
		nano.connect();
	};
	
	connection.on('data', parse);
	nano.on('data', write);
	
	connection.on('error', noop);
	connection.on('connected', onConnect);
	connection.on('close', function onClose () {
		clearTimeout(timer);
		if (nano.isConnected) {
			nano.setConnected(false);
		}
		connection.removeListener('error', noop);
		connection.removeListener('connected', onConnect);
		connection.removeListener('close', onClose);
		connection.removeListener('data', parse);
		nano.removeListener('data', write);
		onConnectionClosed();
	});
	
	return connection;
}

module.exports = function espruinoTcpAdapter (nano, address, port, timeout, retry) {
	var isDisconnect = false;
	var onDisconnect = function () {
		isDisconnect = true;
		nano.removeListener('disconnect', onDisconnect);
	};
	
	nano.on('disconnect', onDisconnect);
	(function setupConnection () {
		try {
			createConnection(nano, address, port, timeout || 10000, function onConnectionClosed () {
				if (!isDisconnect) {
					setTimeout(setupConnection, retry || 5000);
				}
			});
		}
		catch (err) {
			if (!isDisconnect) {
				setTimeout(setupConnection, retry || 5000);
			}
		}
	})();
	
	return nano;
};
