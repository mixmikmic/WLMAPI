const request = require('request');
const config = require('../config.json');
const log4js = require("log4js");

log4js.configure({
  appenders: { system: { type: "file", filename: "./log/system.log" } },
  categories: { default: { appenders: ["system"], level: "info" } }
});

const logger = log4js.getLogger("system");

const tokenUrl = config.tokenUrl;
const username = config.API_Username;
const password = config.API_Password;
module.exports.postToHost = function(sendMssage, webhookURL) {


  request.post({
    url: tokenUrl,
    form: {
      Grant_type: 'password',
      Username: username,
      Password: password
    }
  }, (err, response, body) =>{ 
        res = JSON.parse(body)
        token = res.access_token
        console.log(JSON.stringify(sendMssage), webhookURL);
        logger.info(`send webhook to WMS via ${webhookURL} with message : ${JSON.stringify(sendMssage)}`)
        request.post( webhookURL,{
          auth: {
            'bearer': token
          },
            form: {
              ITEMS : JSON.stringify(sendMssage)
            }
          },
          (error, res, body) => {
            if (error) {
              console.error(error);
              logger.error(error);
              return;
            }
            if (!error) {
              console.log(`statusCode: ${res.statusCode}`);
              console.log(body);
              logger.info(`return message from WMS: ${body}`)
            }
          }
        );


   })




};

