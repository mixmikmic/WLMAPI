const request = require('request');
const config = require('../config.json');

const tokenUrl = config.tokenUrl;
const username = config.API_Username;
const password = config.API_Password;
const mock = `{ "pickingOrderack": { "key": "20230403101805", "orderNo": "order2s", "noteNo": "note", "mainStage": "FINISHED", "orderLine": [ { "lineNo": "1", "ItemNo": "0000334308", "family": "Y122-08", "batchNo": "B", "NMPPStatus": "MC", "NMPPDate": "20231212", "serialIndicator": "S", "difReason": "NONE", "orderedQty": "1", "pickedQty": "1", "location": [ { "locationId": "18888888101-019-002", "logimat": "A1", "trayNo": "1", "user": "touch", "batchNo": "B", "NMPPStatus": "MC", "NMPPDate": "20231212", "serialIndicator": "S", "registerationTime": "20230403110926", "pickedAmount": "1" } ] } ] } } `
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
          console.log(JSON.stringify(mock));
        // console.log(sendMssage, webhookURL);
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

