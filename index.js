var restify = require('restify');
var assert = require('assert-plus');

function IonicClient(options) {
    assert.object(options, 'options');
    assert.string(options.apiToken, 'options.apiToken');
    assert.optionalObject(options.log, 'options.log');
    assert.optionalString(options.url, 'options.url');

    var url = options.url || 'https://api.ionic.io/';

    this.client = restify.createJsonClient({
      log: options.log,
      name: 'IonicClient',
      // type: 'json',
      url: url,
      headers: {
        // 'X-Ionic-Application-Id': options.appId,
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + options.apiToken
      },
      userAgent: 'node-ionic-client'
    });

    if (options.log) {
      this.log = options.log.child({component: 'IonicClient'}, true);
    }
    this.url = options.url;
    this.apiToken = options.apiToken;
}

var fn = IonicClient.prototype;

fn.pushToUsers = function(userIds, profile, notification, options, cb) {
  return this._push('users', userIds, profile, notification, options, cb);
};

fn.push = function(tokens, profile, notifications, options, cb) {
  return this._push('tokens', tokens, profile, notifications, options, cb);
};

fn._push = function(type, tokens, profile, notification, options, cb) {
  assert.string(type, 'type');
  assert.string(profile, 'profile');
  assert.arrayOfString(tokens, 'tokens');
  assert.object(notification, 'notification');
  assert.optionalString(notification.title, 'notification.title');
  assert.optionalString(notification.message, 'notification.message');
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

  // set security profile
  payload.profile = profile;

  this.client.post('/push/notifications', payload, function (err, req, res, obj) {
    if (err) {
      // TODO: add statusCode to error?
      cb(err);
    } else {
      cb(null, obj);
    }
  });
};

fn.status = function(notification_uuid, cb) {
  assert.string(notification_uuid, 'notification_uuid');
  assert.func(cb, 'callback');

  this.client.get('/push/notifications/' + notification_uuid + '/messages', function (err, req, res, obj) {
    if (err) {
      // TODO: add statusCode to error?
      //.log(res.statusCode);
      cb(err);
    } else {
      cb(null, obj);
    }
  });
};

module.exports = {
  createClient: function createClient(options) {
    return (new IonicClient(options));
  }
};
