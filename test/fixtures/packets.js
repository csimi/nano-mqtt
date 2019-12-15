const mqtt = require('mqtt-packet');
const uuid = require('./uuid');
const { id, topic, value } = require('./message');

const connect = mqtt.generate({
	'cmd': 'connect',
	'protocolId': 'MQTT',
	'protocolVersion': 4,
	'clean': false,
	'clientId': uuid,
	'keepalive': 0,
});

const connack = mqtt.generate({
	'cmd': 'connack',
	'returnCode': 0,
	'sessionPresent': false,
});

const disconnect = mqtt.generate({
	'cmd': 'disconnect',
});

const publish = mqtt.generate({
	'cmd': 'publish',
	'messageId': id,
	'topic': topic,
	'payload': value,
	'retain': false,
});

const publishRetain = mqtt.generate({
	'cmd': 'publish',
	'messageId': id,
	'topic': topic,
	'payload': value,
	'retain': true,
});

const subscribe = mqtt.generate({
	'cmd': 'subscribe',
	'messageId': id,
	'subscriptions': [{
		'topic': topic,
		'qos': 0,
	}],
});

const pingreq = mqtt.generate({
	'cmd': 'pingreq',
});

module.exports = {
	connect,
	connack,
	disconnect,
	publish,
	publishRetain,
	subscribe,
	pingreq,
};
