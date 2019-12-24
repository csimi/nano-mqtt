/* global E */

var dgram = require('dgram');

module.exports = function espruinoUdpAdapter (nano, address, port, broadcast) {
	var server = dgram.createSocket('udp4');
	server.bind(typeof broadcast === 'number' ? broadcast : 0, function onBound () {
		server.setBroadcast(Boolean(broadcast));
	});
	
	var parse = function (message) {
		var data = E.toUint8Array(message);
		nano.parse(data);
	};
	var write = function (data, type) {
		var message = E.toString(data);
		server.send(message, 0, message.length, port, address, function onSent () {
			if (type === nano.DISCONNECT) {
				server.close();
				server.removeListener('message', parse);
				nano.removeListener('data', write);
			}
		});
	};
	
	server.on('message', parse);
	nano.on('data', write);
	
	if (typeof broadcast === 'number') {
		setTimeout(nano.setConnected.bind(nano, true), 0);
	}
	else {
		setTimeout(nano.connect.bind(nano), 0);
	}
	
	return nano;
};
