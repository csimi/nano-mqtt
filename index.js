const { EventEmitter } = require('events');
const { inherits } = require('util');
const nanoMQTT = require('./lib');

inherits(nanoMQTT, EventEmitter);

function nanoEmitterMQTT (...args) {
	const nano = new nanoMQTT(...args);
	EventEmitter.call(nano);
	return nano;
}

module.exports = nanoEmitterMQTT;
