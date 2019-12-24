const { EventEmitter } = require('events');

class DgramServer extends EventEmitter {
	bind (port, callback) {
		if (typeof callback === 'function') {
			callback();
		}
	}
	
	setBroadcast () {}
	
	send (...args) {
		if (typeof args[args.length - 1] === 'function') {
			args[args.length - 1]();
		}
	}
	
	close () {}
}

const dgramServer = new DgramServer();

const createSocket = () => dgramServer;

module.exports = {
	dgramServer,
	createSocket,
};
