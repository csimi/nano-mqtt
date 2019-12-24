const { expect } = require('chai');
const { createSandbox, match } = require('sinon');
const proxyquire = require('proxyquire');
const dgram = require('dgram');
const { dgramServer, createSocket } = require('../mocks/dgram');
const nanoMQTT = require('../..');
const nanoUDP = require('../../lib/adapter/espruino-udp');
const nanoUDPStub = proxyquire('../../lib/adapter/espruino-udp', {
	'dgram': {
		createSocket,
	},
});
const uuid = require('../fixtures/uuid');
const packets = require('../fixtures/packets');
const { topic, value } = require('../fixtures/message');
const espruino = require('../mocks/espruino');

describe('adapter/espruino-udp', () => {
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
		let server;
		
		beforeEach(async () => {
			server = dgram.createSocket('udp4');
			server.bind();
			
			await new Promise((resolve) => server.on('listening', resolve));
		});
		
		afterEach(async () => {
			nano.disconnect();
			server.close();
		});
		
		it('connects to udp server', async () => {
			const { port } = server.address();
			const promise = new Promise((resolve) => server.on('message', resolve));
			
			nanoUDP(nano, '127.0.0.1', port);
			
			const message = await promise;
			
			return expect(message).to.eql(packets.connect);
		});
		
		it('receives message from udp server', async () => {
			const { port } = server.address();
			const promise = new Promise((resolve) => nano.on('message', (...args) => resolve(args)));
			
			server.on('message', (message, client) => {
				server.send(packets.publish, client.port, client.address);
			});
			nanoUDP(nano, '127.0.0.1', port);
			
			const message = await promise;
			
			return expect(message).to.eql([
				topic,
				value,
			]);
		});
	});
	
	describe('unit', () => {
		const sandbox = createSandbox();
		
		beforeEach(() => {
			sandbox.stub(dgramServer, 'bind').callThrough();
			sandbox.stub(dgramServer, 'send').callThrough();
			sandbox.stub(dgramServer, 'setBroadcast');
			sandbox.stub(dgramServer, 'close');
			sandbox.stub(dgramServer, 'on');
			sandbox.stub(dgramServer, 'removeListener');
		});
		
		afterEach(() => {
			sandbox.restore();
		});
		
		it('binds to random port ands sets broadcast if broadcast is true', () => {
			nanoUDPStub(nano, '127.0.0.1', 1883, true);
			
			return (
				expect(dgramServer.bind).to.have.been.calledOnceWith(0, match.func) &&
				expect(dgramServer.setBroadcast).to.have.been.calledOnceWith(true)
			);
		});
		
		it('binds to random port if broadcast is not a number', () => {
			nanoUDPStub(nano, '127.0.0.1', 1883);
			
			return (
				expect(dgramServer.bind).to.have.been.calledOnceWith(0, match.func) &&
				expect(dgramServer.setBroadcast).to.have.been.calledOnceWith(false)
			);
		});
		
		it('binds to defined port ands sets broadcast if broadcast is a number', () => {
			nanoUDPStub(nano, '127.0.0.1', 1883, 1883);
			
			return (
				expect(dgramServer.bind).to.have.been.calledOnceWith(1883, match.func) &&
				expect(dgramServer.setBroadcast).to.have.been.calledOnceWith(true)
			);
		});
		
		it('closes the server on disconnect', async () => {
			nanoUDPStub(nano, '127.0.0.1', 1883);
			
			nano.disconnect();
			
			return expect(dgramServer.close).to.have.been.calledOnce;
		});
	});
});
