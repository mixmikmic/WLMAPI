const request = require('request');
const log4js = require("log4js");
log4js.configure({
    appenders: { system: { type: "file", filename: "./log/system.log" } },
    categories: { default: { appenders: ["system"], level: "info" } }
});

const logger = log4js.getLogger("system");
function postToWamas(sendMssage, WlmRestURL) {
    request.post(
        WlmRestURL,
        {
            json: sendMssage,
        },
        (error, res, body) => {
            if (error) {
                console.error(error);
                logger.error(error);
                return;
            }
            console.log(sendMssage);
            console.log(`statusCode: ${res.statusCode}`, res.body);
            logger.info(`statusCode: ${res.statusCode}`);
        }
    ).auth("ssi", "ssi", false);
    logger.info("send telegram to WAMAS : " + JSON.stringify(sendMssage));
}

module.exports = { postToWamas };
