'use strict';

var restify = require('restify');
var assert = require('assert-plus');
var Promise = require('bluebird');

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
      // 'Content-Type': 'application/json',
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

fn.pushToUsers = function(userIds, profile, notification, options) {
  return this._push('user_ids', userIds, profile, notification, options);
};

fn.push = function(tokens, profile, notifications, options) {
  return this._push('tokens', tokens, profile, notifications, options);
};

fn._push = function(type, tokensOrUserIds, profile, notification, options) {
  assert.string(type, 'type');
  assert.string(profile, 'profile');
  assert.arrayOfString(tokensOrUserIds, 'tokensOrUserIds');
  assert.object(notification, 'notification');
  assert.optionalString(notification.title, 'notification.title');
  assert.optionalString(notification.message, 'notification.message');
  assert.optionalObject(notification.ios, 'notification.ios');
  assert.optionalObject(notification.android, 'notification.android');
  assert.object(options, 'options');
  assert.optionalNumber(options.scheduled, 'options.scheduled');
  assert.optionalBool(options.production, 'options.production');

  var payload = {
    notification: notification
  };

  // set user_id or tokens field
  payload[type] = tokensOrUserIds;

  if (options.scheduled) {
    payload.scheduled = options.scheduled;
  }

  if (options.production) {
    payload.production = options.production;
  }

  // set security profile
  payload.profile = profile;

  var post = Promise.promisify(this.client.post, { context: this.client, multiArgs: true });
  return post('/push/notifications', payload)
    .spread(function(req, res, obj) {
      return Promise.resolve(obj, req, res);
    });
};

/*
  Notifications: The individual push notifications you create and send via the API or the ionic.io dashboard. These may have any number of recipients (via user ID's, device tokens, or queries).

  Messages: A recipient of a notification. For instance, a push you send to 10 device tokens will be comprised of 10 messages. These track their delivery status independently, giving you granular detail on their delivery.
*/

fn.status = function(notification_uuid) {
  assert.string(notification_uuid, 'notification_uuid');

  var get = Promise.promisify(this.client.get, { context: this.client, multiArgs: true });
  return get('/push/notifications/' + notification_uuid + '/messages')
    .spread(function(req, res, obj) {
      return Promise.resolve(obj, req, res);
    });
};

// Todo, highlight invalid and valid tokens, remove invalid

module.exports = {
  createClient: function createClient(options) {
    return (new IonicClient(options));
  }
};
