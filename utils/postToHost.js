const request = require('request');
const config = require('../config.json');

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
              return;
            }
            if (!error) {
              console.log(`statusCode: ${res.statusCode}`);
              console.log(body);
            }
          }
        );


   })




};

