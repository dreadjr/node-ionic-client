var restify = require('restify');
var assert = require('assert-plus');

function IonicClient(options) {
    assert.object(options, 'options');
    assert.optionalObject(options.log, 'options.log');
    assert.string(options.appId, 'options.appId');
    assert.string(options.apiKey, 'options.apiKey');
    assert.optionalString(options.url, 'options.url');

    var url = options.url || 'https://push.ionic.io/api/v1/';

    this.client = restify.createClient({
      log: options.log,
      name: 'IonicClient',
      type: 'json',
      url: url,
      headers: {
        'X-Ionic-Application-Id': options.appId,
      },
      userAgent: 'node-ionic-client'
    });

    if (options.log) {
      this.log = options.log.child({component: 'IonicClient'}, true);
    }
    this.url = options.url;
    this.appId = options.appId;
    this.apiKey = options.apiKey;

    if (options.apiKey) {
      this.client.basicAuth(options.apiKey, "");
    }
}

var fn = IonicClient.prototype;

fn.push = function(tokens, messages, cb) {
  assert.string(task, 'task');
  assert.func(cb, 'callback');

  // user_ids || tokens
  // scheduled | unix time stamp
  // notification
  // production: true | false

  this.client.post('/push', {task: task}, function (err, req, res, obj) {
    if (err) {
      // TODO: add statusCode to error?
      cb(err);
    } else {
      cb(null, obj);
    }
  });
}

fn.status = function(statusId, cb) {
  assert.string(statusId, 'statusId');
  assert.func(cb, 'callback');

  this.client.get('/status/' + statusId, function (err, req, res, obj) {
    if (err) {
      // TODO: add statusCode to error?
      cb(err);
    } else {
      cb(null, obj);
    }
  });
}

module.exports = {
  createClient: function createClient(options) {
    return (new IonicClient(options));
  }
};
}
};
