/* global E */

var dgram = require('dgram');

module.exports = function espruinoUdpAdapter (nano, address, port, isBroadcast) {
	var server = dgram.createSocket('udp4');
	server.bind(function onBound () {
		server.setBroadcast(Boolean(isBroadcast));
	});
	
	server.on('message', function onMessage (message) {
		var data = E.toUint8Array(message);
		nano.parse(data);
	});
	nano.on('data', function onData (data) {
		var message = E.toString(data);
		server.send(message, 0, message.length, port, address);
	});
	
	if (isBroadcast) {
		setTimeout(nano.setConnected.bind(nano, true), 0);
	}
	else {
		setTimeout(nano.connect.bind(nano));
	}
	
	return nano;
};
