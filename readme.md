[![npm version](https://img.shields.io/npm/v/nano-mqtt.svg?logo=npm)](https://www.npmjs.com/package/nano-mqtt)
[![build status](https://github.com/csimi/nano-mqtt/workflows/build/badge.svg)](https://github.com/csimi/nano-mqtt/actions)
[![codecov](https://codecov.io/gh/csimi/nano-mqtt/branch/master/graph/badge.svg)](https://codecov.io/gh/csimi/nano-mqtt)

# About

This package has been created with modularity in mind.
You don't need to import any networking related code if you're planning on reading messages from stdout and shouting them at random strangers (or more conveniently using a radio module).

The core is written in ES5 to be able to run on very basic interpreters as long as they support Uint8Array (e.g. Espruino).

You are in charge of listening for the generated messages and sending them to an interface.


This is made easier by the included adapters:

* espruino-tcp
* espruino-udp

# Usage

Install using npm:

```
$ npm install nano-mqtt
```

## Node.js

```
const nanoMQTT = require('nano-mqtt');

const nano = new nanoMQTT('device-uuid');
```

## Espruino TCP

```
const nanoMQTT = require('nano-mqtt/lib');
const nanoTCP = require(nano-mqtt/lib/adapter/espruino-tcp');

const nano = nanoTCP(new nanoMQTT('device-uuid'), '192.168.0.1', 1883);
```

## Espruino UDP

### Basic usage with a UDP broker

```
const nanoMQTT = require('nano-mqtt/lib');
const nanoUDP = require(nano-mqtt/lib/adapter/espruino-udp');

const broadcast = true; // if we do not know the exact ip address of the broker
const nano = nanoUDP(
	new nanoMQTT('device-uuid'),
	broadcast ? '192.168.0.255' : '192.168.0.1',
	1883,
	broadcast,
);
```

### UDP mesh without broker

```
const nanoMQTT = require('nano-mqtt/lib');
const nanoUDP = require(nano-mqtt/lib/adapter/espruino-udp');

const broadcast = 1883;
const nano = nanoUDP(new nanoMQTT('device-uuid'), '192.168.0.255', 1883, broadcast);
```

# API

## Event: 'connected'

Emitted after receiving a `CONNACK` packet or `setConnected` was called with true.

```
nano.on('connected', () => {
	console.log('we are connected to broker');
});
```

## Event: 'disconnected'

Emitted after `setConnected` was called with false.

```
nano.on('disconnected', () => {
	console.log('we have been disconnected from broker');
});
```

## Event: 'message'

Emitted after receiving a `PUBLISH` packet.

* topic `<string>`
* payload `<string>`

```
nano.on('message', (topic, payload) => {
	console.log('received message', topic, payload);
});
```

## Event: 'data'

Emitted when a packet has been generated and is ready to be sent.

* packet `<Uint8Array>`
* type `<number>`

```
nano.on('data', (packet, type) => {
	console.log('packet has been generated');
	socket.send(packet);
});
```

## Event: 'error'

Emitted when trying to parse an unknown packet.

* packet `<Uint8Array>`

```
nano.on('error', (packet) => {
	console.log('unknown packet', packet);
});
```

## setConnected(isConnected)

* isConnected `<boolean>`

Sets the connection status and emits the corresponding event (`connected` or `disconnected`).

## connect()

Generates and emits a `CONNECT` packet.

## disconnect()

Generates and emits a `DISCONNECT` packet.

## publish(topic, payload, retain)

* topic `<string>`
* payload `<string>`
* retain `<boolean>`

Generates and emits a `PUBLISH` packet. Retain is false by default.

## subscribe(topic)

* topic `<string>`

Generates and emits a `SUBSCRIBE` packet.

## parse(data)

* data `<Uint8Array>`

Parses data packet and emits the corresponding event, or `error` on unknown packet type.
The parsed packet is returned in the format of `[PACKET_INT_TYPE, ...value]`
