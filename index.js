var restify = require('restify');
var assert = require('assert-plus');

function IonicClient(options) {
    assert.object(options, 'options');
    assert.optionalObject(options.log, 'options.log');
    assert.string(options.appId, 'options.appId');
    assert.string(options.apiKey, 'options.apiKey');
    assert.optionalString(options.url, 'options.url');

    var url = options.url || 'https://push.ionic.io/';

    this.client = restify.createJsonClient({
      log: options.log,
      name: 'IonicClient',
      // type: 'json',
      url: url,
      headers: {
        'X-Ionic-Application-Id': options.appId,
        'Authorization': new Buffer(options.apiKey + ':').toString('base64')
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
      //this.client.basicAuth("", options.apiKey);
    }
}

var fn = IonicClient.prototype;

fn.pushToUsers = function(userIds, notification, options, cb) {
  return this._push('users', userIds, notification, options, cb);
}

fn.push = function(tokens, notifications, options, cb) {
  return this._push('tokens', tokens, notifications, options, cb);
}

fn._push = function(type, tokens, notification, options, cb) {
  assert.string(type, 'type');
  assert.arrayOfString(tokens, 'tokens');
  assert.object(notification, 'notification');
  assert.optionalString(notification.alert, 'notification.alert');
  assert.optionalObject(notification.ios, 'notification.ios');
  assert.optionalObject(notification.android, 'notification.android');
  assert.object(options, 'options');
  assert.optionalNumber(options.scheduled, 'options.scheduled');
  assert.optionalBool(options.production, 'options.production');
  assert.func(cb, 'callback');

  var payload = {
    notification: notification
  };

  if (type === 'users') {
    payload.user_ids = tokens;
  } else {
    payload.tokens = tokens;
  }

  if (options.scheduled) {
    payload.scheduled = options.scheduled;
  }

  if (options.production) {
    payload.production = options.production;
  }

  this.client.post('/api/v1/push', payload, function (err, req, res, obj) {
    if (err) {
      // TODO: add statusCode to error?
      cb(err);
    } else {
      cb(null, obj);
    }
  });
}

fn.status = function(messageId, cb) {
  assert.string(messageId, 'messageId');
  assert.func(cb, 'callback');

  this.client.get('/api/v1/status/' + messageId, function (err, req, res, obj) {
    if (err) {
      // TODO: add statusCode to error?
      //.log(res.statusCode);
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
