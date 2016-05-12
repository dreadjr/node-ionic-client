node-ionic-client
=================

[![Build Status](https://travis-ci.org/dreadjr/node-ionic-client.svg?branch=master)](https://travis-ci.org/dreadjr/node-ionic-client)
[![Npm Version](https://img.shields.io/npm/v/ionic-client.svg)](https://www.npmjs.com/package/ionic-client)

node.js ionic client


## Usage

```js
var ionic = require('ionic-client');
var bunyan = require('bunyan');
var restify = require('restify');

require('dotenv').load();

var log = bunyan.createLogger({
    name: 'logger',
    level: process.env.LOG_LEVEL || 'trace',
    serializers: restify.bunyan.serializers,
    stream: process.stdout
});

var options = {
  apiToken: process.env.IONIC_API_TOKEN,
  log: log
};

var client = new ionic(options);

var notification = {
  message: 'test message',
  title: 'application',

  ios: {
    payload: "payload"
  },
  android: {
    payload: "payload"
  }
};

var pushOptions = {
  scheduled: new Date().getTime(),
  production: true
};

// push
client.push(['token123'], process.env.IONIC_PUSH_SECURITY_PROFILE, notification, pushOptions)
  .then(function (result) {
    console.log('push', result);
  });

// push to users
client.push(['uid123'], process.env.IONIC_PUSH_SECURITY_PROFILE, notification, pushOptions)
  .then(function (result) {
    console.log('push', result);
  });

// STATUS of message uuid
var pushResult = {
  data: {
    uuid: 'messageUuid'
  }
};

return client.status(pushResult.data.uuid)
  .then(function (result) {
    console.log('status', result);
  });
```
