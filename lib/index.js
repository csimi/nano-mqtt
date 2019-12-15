/* global Uint8Array */

var FCC = String.fromCharCode;

function createField (value) {
	return FCC(value.length >> 8, value.length & 255) + value;
}

function createPacket (cmd, variable, payload) {
	var value = variable + payload;
	var length = value.length;
	
	var buf = new Uint8Array(2 + length);
	
	buf[0] = cmd;
	buf[1] = length;
	
	for (var i = 0; i < length; i++) {
		buf[i + 2] = value.charCodeAt(i);
	}
	
	return buf;
}

function nano (uid) {
	this.uid = uid;
	this.isConnected = false;
}

nano.prototype.CONNECT = 1 << 4;
nano.prototype.CONNACK = 2 << 4;
nano.prototype.PUBLISH = 3 << 4;
nano.prototype.SUBSCRIBE = 8 << 4;
nano.prototype.PINGREQ = 12 << 4;
nano.prototype.DISCONNECT = 14 << 4;

nano.prototype.setConnected = function setConnected (isConnected) {
	this.isConnected = isConnected;
	this.emit(isConnected ? 'connected' : 'disconnected');
};

nano.prototype.connect = function connect () {
	this.emit('data', createPacket(
		nano.prototype.CONNECT,
		createField('MQTT') + FCC(
			4,
			0,
			0,
			0
		),
		createField(this.uid)
	), nano.prototype.CONNECT);
};

nano.prototype.disconnect = function disconnect () {
	this.emit('data', createPacket(
		nano.prototype.DISCONNECT,
		'',
		''
	), nano.prototype.DISCONNECT);
};

nano.prototype.publish = function publish (topic, message, retain) {
	var flags = retain ? 1 : 0;
	this.emit('data', createPacket(
		nano.prototype.PUBLISH | flags,
		createField(topic),
		message
	), nano.prototype.PUBLISH);
};

nano.prototype.subscribe = function subscribe (topic) {
	this.emit('data', createPacket(
		nano.prototype.SUBSCRIBE | 2,
		FCC(1 << 8, 1 & 255),
		createField(topic) + FCC(0)
	), nano.prototype.SUBSCRIBE);
};

nano.prototype.parse = function parse (data) {
	var cmd = data[0];
	var message = data.toString();
	if (cmd === nano.prototype.CONNACK) {
		this.setConnected(true);
		return [nano.prototype.CONNACK];
	}
	else if (cmd === nano.prototype.PUBLISH) {
		var index = 4 + ((data[2] << 8) | data[3]);
		var topic = message.slice(4, index);
		var payload = message.slice(index);
		
		this.emit('message', topic, payload);
		return [nano.prototype.PUBLISH, topic, payload];
	}
	else if (cmd === nano.prototype.PINGREQ) {
		this.emit('ping');
		return [nano.prototype.PINGREQ];
	}
	else {
		this.emit('error', data);
	}
	
	return [];
};

module.exports = nano;
