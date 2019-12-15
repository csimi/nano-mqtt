const { expect } = require('chai');
const sinon = require('sinon');
const tou8 = require('buffer-to-uint8array');
const nanoMQTT = require('../..');
const uuid = require('../fixtures/uuid');
const packets = require('../fixtures/packets');
const { topic, value } = require('../fixtures/message');

describe('generate', () => {
	let nano;
	let spy;

	beforeEach(() => {
		spy = sinon.spy();
		
		nano = new nanoMQTT(uuid);
		nano.on('data', spy);
	});
	
	afterEach(() => {
		nano.removeAllListeners();
	});
	
	it('generates connect packet', () => {
		nano.connect();
		
		return expect(spy).to.have.been.calledOnceWith(tou8(packets.connect));
	});
	
	it('generates disconnect packet', () => {
		nano.disconnect();
		
		return expect(spy).to.have.been.calledOnceWith(tou8(packets.disconnect));
	});
	
	it('generates publish packet', () => {
		nano.publish(topic, value);
		
		return expect(spy).to.have.been.calledOnceWith(tou8(packets.publish));
	});
	
	it('generates retained publish packet', () => {
		nano.publish(topic, value, true);
		
		return expect(spy).to.have.been.calledOnceWith(tou8(packets.publishRetain));
	});
	
	it('generates subscribe packet', () => {
		nano.subscribe(topic);
		
		return expect(spy).to.have.been.calledOnceWith(tou8(packets.subscribe));
	});
});
