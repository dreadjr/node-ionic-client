var RequestClient  = require("feignjs-request");

var ionicApiDescription = {
  push: "POST /push",
  getStatus: "GET /status/{statusId}"
}

module.exports = {
  api: {
    description: ionicApiDescription,
    client: function(appId, apiKey, apiUri) {
      var defaults = {
        headers: {
          'Content-Type': 'application/json',
          'X-Ionic-Application-Id': appId,
          'Authorization': new Buffer(apiKey + ':').toString('base64')
        }
      };

      var reqClient = new RequestClient(defaults);

      return feignjs.builder()
        .client(reqClient)
        .target(githubApiDescription, apiUri || 'https://push.ionic.io/api/v1/');
    }
  }
};
