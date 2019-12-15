const { expect } = require('chai');
const sinon = require('sinon');
const nanoMQTT = require('../..');
const uuid = require('../fixtures/uuid');

describe('core', () => {
	let nano;
	let spy;

	beforeEach(() => {
		spy = sinon.spy();
		
		nano = new nanoMQTT(uuid);
	});
	
	afterEach(() => {
		nano.removeAllListeners();
	});
	
	it('emits connected event', () => {
		nano.on('connected', spy);
		
		nano.setConnected(true);
		
		return expect(spy).to.have.been.calledOnce;
	});
	
	it('emits disconnected event', () => {
		nano.on('disconnected', spy);
		
		nano.setConnected(false);
		
		return expect(spy).to.have.been.calledOnce;
	});
});
