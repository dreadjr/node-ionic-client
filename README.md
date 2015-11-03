node-ionic-client
=================

[![Build Status](https://travis-ci.org/dreadjr/node-ionic-client.svg?branch=master)](https://travis-ci.org/dreadjr/node-ionic-client)
[![Npm Version](https://img.shields.io/npm/v/ionic-client.svg)](https://www.npmjs.com/package/ionic-client)

node.js bing-search-api client


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
  appId: process.env.IONIC_APP_ID,
  apiKey: process.env.IONIC_PRIVATE_KEY,
  log: log
};

var client = ionic.createClient(options);

client.status('080b6c8a81ce11e5bb81ba2a83e8cee0', function(err, msg) {
  if (err) {
    console.error(err);
  }

  console.log('msg', msg);
});

client.push(['token123'], { alert: 'Hello', ios: { }, android: {}, scheduled: new Date().getTime(), production: true }, {}, function(err, msg) {
  if (err) {
    console.error(err);
  }

  console.log('msg', msg);
});

client.pushToUsers(['uid1'], { alert: 'Hello', ios: { }, android: {}, scheduled: new Date().getTime(), production: true }, {}, function(err, msg) {
  if (err) {
    console.error(err);
  }

  console.log('msg', msg);
});
```
