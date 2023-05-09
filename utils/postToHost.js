const request = require('request');
const config = require('../config.json');

const webhookURL = config.webhookURL;

module.exports.postToHost = function(sendMssage) {
  request.post(
    webhookURL,
    {
      json: sendMssage,
    },
    (error, res, body) => {
      if (error) {
        console.error(error);
        return;
      }
      if (!error) {
        console.log(`statusCode: ${res.statusCode}`);
        console.log(body);
      }
    }
  );
};
