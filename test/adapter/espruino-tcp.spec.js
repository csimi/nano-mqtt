const { expect } = require('chai');
const net = require('net');
const nanoMQTT = require('../..');
const nanoTCP = require('../../lib/adapter/espruino-tcp');
const uuid = require('../fixtures/uuid');
const packets = require('../fixtures/packets');
//const { topic, value } = require('../fixtures/message');
const espruino = require('../mocks/espruino');

describe('adapter/espruino-tcp', () => {
	let nano;
	
	beforeEach(() => {
		nano = new nanoMQTT(uuid);
	});
	
	before(() => {
		global.E = espruino;
	});
	
	after(() => {
		delete global.E;
	});
	
	describe('integration', () => {
		let port = 0;
		let server;
		let socket;
		let data;
		
		const createServer = () => {
			data = new Promise((resolve) => {
				server = net.createServer((connection) => {
					socket = connection;
					socket.on('data', resolve);
				});
			});
			
			return new Promise((resolve) => {
				server.listen(port, () => {
					port = server.address().port;
					resolve();
				});
			});
		};
		
		const closeServer = () => {
			return new Promise((resolve) => {
				if (socket) {
					socket.destroy();
				}
				server.close(() => {
					port = 0;
					resolve();
				});
			});
		};
		
		beforeEach(async () => {
			await createServer();
		});
		
		afterEach(async () => {
			nano.disconnect();
			await closeServer();
		});
		
		it('connects to tcp server', async () => {
			nanoTCP(nano, '127.0.0.1', port);
			
			const message = await data;
			
			return expect(message).to.eql(packets.connect);
		});
	
		it('parses connack packet and emits connected event', async () => {
			const connected = new Promise((resolve) => {
				nano.once('connected', resolve);
			});
			
			nanoTCP(nano, '127.0.0.1', port);
			await data;
			socket.write(packets.connack);
			
			await connected;
		});
		
		it('reconnects to server', async () => {
			nanoTCP(nano, '127.0.0.1', port, 10000, 1);
			
			await data;
			socket.write(packets.connack);
			
			const disconnected = new Promise((resolve) => {
				nano.once('disconnected', resolve);
			});
			const previousPort = port;
			await closeServer();
			await disconnected;
			port = previousPort;
			
			// reconnect
			const reconnected = new Promise((resolve) => {
				nano.once('connected', resolve);
			});
			await createServer();
			
			await data;
			socket.write(packets.connack);
			
			await reconnected;
		});
		
		it('disconnects from server', async () => {
			nanoTCP(nano, '127.0.0.1', port, 10000, 1);
			
			await data;
			
			const disconnect = new Promise((resolve) => {
				socket.once('close', resolve);
			});
			
			socket.write(packets.connack);
			nano.disconnect();
			
			await disconnect;
		});
	});
});
