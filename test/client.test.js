// nock
var bunyan = require('bunyan');
var restify = require('restify');

require('dotenv').load();

var ionic = require('./../');

var log = bunyan.createLogger({
    name: 'todo_unit_test',
    level: process.env.LOG_LEVEL || 'trace',
    serializers: restify.bunyan.serializers,
    stream: process.stdout
});

var options = {
  appId: process.env.IONIC_APP_ID,
  apiKey: process.env.IONIC_PRIVATE_KEY,
  // log: log
};

var client = ionic.createClient(options);

// client.status('080b6c8a81ce11e5bb81ba2a83e8cee0', function(err, msg) {
//   if (err) {
//     console.error(err);
//   }
//
//   console.log('msg', msg);
// });
//
// client.push(['token123'], { alert: 'Hello', ios: { } }, {}, function(err, msg) {
//   if (err) {
//     console.error(err);
//   }
//
//   console.log('msg', msg);
// });
