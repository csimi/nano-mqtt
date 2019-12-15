const sourceMapSupport = require('source-map-support');
const chai = require('chai');
const sinonChai = require('sinon-chai');

sourceMapSupport.install({
	'hookRequire': true,
});

chai.use(sinonChai);
