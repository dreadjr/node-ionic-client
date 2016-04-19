// nock
var bunyan = require('bunyan');
var restify = require('restify');

require('dotenv').load();

var ionic = require('./../');

var log = bunyan.createLogger({
    name: 'unt_test',
    level: process.env.LOG_LEVEL || 'trace',
    serializers: restify.bunyan.serializers,
    stream: process.stdout
});

var options = {
  apiToken: process.env.IONIC_API_TOKEN,
  // log: log
};

var client = ionic.createClient(options);

client.push(['token123'], process.env.IONIC_PUSH_SECURITY_PROFILE, { message: 'Hello', ios: { } }, {}, function(err, msg) {
  if (err) {
    console.error(err);
    return;
  }

  console.log('msg', JSON.stringify(msg));

  setTimeout(function() {
    client.status(msg.data.uuid, function(err, msg) {
      if (err) {
        console.error(err);
      }

      console.log('msg status', JSON.stringify(msg));
    });
  }, 5000);
 });
