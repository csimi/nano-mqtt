const { expect } = require('chai');
const sinon = require('sinon');
const nanoMQTT = require('../..');
const uuid = require('../fixtures/uuid');
const packets = require('../fixtures/packets');
const { topic, value } = require('../fixtures/message');

describe('parse', () => {
	let nano;
	let spy;

	beforeEach(() => {
		spy = sinon.spy();
		
		nano = new nanoMQTT(uuid);
	});
	
	afterEach(() => {
		nano.removeAllListeners();
	});
	
	it('parses connack packet', () => {
		nano.on('connected', spy);
		
		nano.parse(packets.connack);
		
		return expect(spy).to.have.been.calledOnce;
	});
	
	it('parses publish packet', () => {
		nano.on('message', spy);
		
		nano.parse(packets.publish);
		
		return expect(spy).to.have.been.calledOnceWith(topic, value);
	});
	
	it('parses pingreq packet', () => {
		nano.on('ping', spy);
		
		nano.parse(packets.pingreq);
		
		return expect(spy).to.have.been.calledOnce;
	});
	
	it('emits unknown packet as error', () => {
		const data = Buffer.from([1337]);
		nano.on('error', spy);
		
		nano.parse(data);
		
		return expect(spy).to.have.been.calledOnceWith(data);
	});
});
