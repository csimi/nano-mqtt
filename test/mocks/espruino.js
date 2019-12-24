const tou8 = require('buffer-to-uint8array');

module.exports.toUint8Array = (value) => tou8(value);
module.exports.toString = (value) => Buffer.from(value).toString('utf8');
