'use strict';

var nock = require('nock');
var sinon = require('sinon');
var Promise = require('bluebird');
var _ = require('lodash');
var respect = require('respect');

var chai = require('chai');
chai.use(respect.chaiPlugin());

var assert = chai.assert;
var should = chai.should();
var expect = chai.expect;


describe('client', function () {

  var bunyan = require('bunyan');
  var restify = require('restify');
  var ionic = require('./../');

  process.env.IONIC_APP_ID = 'IONIC_APP_ID';
  process.env.IONIC_API_TOKEN = 'API_TOKEN';
  process.env.IONIC_PUSH_SECURITY_PROFILE = 'PUSH_SECURITY_PROFILE';

  var log = bunyan.createLogger({
    name: 'unit_test',
    level: process.env.LOG_LEVEL || 'trace',
    serializers: restify.bunyan.serializers,
    stream: process.stdout
  });

  var options = {
    apiToken: process.env.IONIC_API_TOKEN,
    // log: log
  };

  var client = new ionic(options);

  before(function () {
    nock.disableNetConnect();
  });

  after(function () {
    nock.enableNetConnect();
  });

  describe('push', function () {
    let request, response;

    before(function () {
      request = {
        "notification": {
          "message": "test message",
          "title": "application",
          "ios": {
            "payload": {
              "$state": "ui.router.state",
              "$stateParams": "{\"uid\": \"uid123\"}"
            }
          },
          "android": {
            "payload": {
              "$state": "ui.router.state",
              "$stateParams": "{\"uid\": \"uid123\"}"
            }
          }
        },
        "tokens": ["token123"],
        "production": true,
        "profile": process.env.IONIC_PUSH_SECURITY_PROFILE
      };

      response = {
        "meta": {
          "version": "2.0.0-beta.0",
          "status": 201,
          "request_id": "c14f4e00-442c-476c-85f2-0aa425c716e7"
        },
        "data": {
          "status": "open",
          "config": {
            "profile": process.env.IONIC_PUSH_SECURITY_PROFILE,
            "tokens": ["token123"],
            "notification": {
              "message": "test message",
              "android": {
                "payload": {
                  "$state": "ui.router.state",
                  "$stateParams": "{\"uid\": \"uid123\"}"
                }
              },
              "ios": {
                "payload": {
                  "$state": "ui.router.state",
                  "$stateParams": "{\"uid\": \"uid123\"}"
                }
              },
              "title": "application"
            }
          },
          "state": "enqueued",
          "app_id": process.env.IONIC_APP_ID,
          "uuid": "7add1be3-39ec-4a05-b6df-1b2294fa9292",
          "created": "2016-05-06T22:08:55.836463+00:00"
        }
      };

      nock('https://api.ionic.io:443', {
          "encodedQueryParams": true
        })
        .post('/push/notifications', request)
        .reply(201, response, {
          connection: 'keep-alive',
          server: 'nginx',
          date: 'Fri, 06 May 2016 22:08:55 GMT',
          'content-type': 'application/json; charset=utf-8',
          'content-length': '706',
          via: '1.1 vegur, 1.1 vegur',
          'access-control-allow-credentials': 'true',
          'access-control-allow-methods': 'HEAD,GET,POST,PATCH,PUT,DELETE,OPTIONS',
          'access-control-allow-headers': 'DNT,Authorization,X-CSRFToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type'
        });
    });

    it('should push message to device token', function () {
      var payload = {
        $state: "ui.router.state",
        $stateParams: "{\"uid\": \"" + 'uid123' + "\"}"
      };

      var notification = {
        message: 'test message',
        title: 'application',

        ios: {
          payload: payload
        },
        android: {
          payload: payload
        }
      };

      var options = { /*scheduled: new Date().getTime(),*/
        production: true
      };

      return client.push(request.tokens, request.profile, notification, options)
        .then(function (result) {
          expect(result).to.eql(response);
        });
    });
  });

  describe('status', function () {
    let request, response;

    before(function () {
      request = {
        uuid: '7add1be3-39ec-4a05-b6df-1b2294fa9292'
      };

      response = {
        "meta": {
          "version": "2.0.0-beta.0",
          "status": 200,
          "request_id": "d5576217-bef2-409a-9e2d-be87374f3f19"
        },
        "data": [
          {
            "status": "sent",
            "user_id": null,
            "error": null,
            "notification": request.uuid,
            "token": {
              "id": "ae6906fa606850320a8c3258bcbf35d5",
              "type": "ios",
              "valid": true,
              "app_id": "IONIC_APP_ID",
              "token": "15f3c452a49d4697d5324484a0ba4b6cd10aa8bba2720c8676a9fdc6ded19580",
              "created": "2016-05-06T22:08:55.957454+00:00",
              "invalidated": null
            },
            "uuid": "bc4f14d1-1761-4e26-ab2f-1b8451df06c7",
            "created": "2016-05-06T22:08:56.023611+00:00"
          }
        ]
      };

      nock('https://api.ionic.io:443', {
          "encodedQueryParams": true
        })
        .get('/push/notifications/' + request.uuid + '/messages')
        .reply(200, response, {
          connection: 'keep-alive',
          server: 'nginx',
          date: 'Fri, 06 May 2016 22:09:11 GMT',
          'content-type': 'application/json; charset=utf-8',
          'content-length': '569',
          vary: 'Accept-Encoding',
          via: '1.1 vegur, 1.1 vegur',
          'access-control-allow-credentials': 'true',
          'access-control-allow-methods': 'HEAD,GET,POST,PATCH,PUT,DELETE,OPTIONS',
          'access-control-allow-headers': 'DNT,Authorization,X-CSRFToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type'
        });
    });

    it('should return status of uuid', function () {
      var pushResult = {
        data: {
          uuid: request.uuid
        }
      };

      return client.status(pushResult.data.uuid)
        .then(function (result) {
          expect(result).to.eql(response);
        });
    });
  });
});
