const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const log4js = require("log4js");
const { isNull } = require('util');
const { json } = require('express');
const webhook = require('./webhook');
const { log } = require('console');
const { handleStorageOrder } = require('./orderHandler/storageOrderHandler');
const { handleItemMaster } = require('./orderHandler/itemMasterHandler');
const { handlePickingOrder } = require('./orderHandler/pickingOrderHandler');
const { handleInventoryOrder } = require('./orderHandler/inventoryOrderHandler');
const { postToWamas } = require('./utils/postToWamas');
const { getAllArray } = require('./utils/getAllArray');


filename = "./config.json";
let rawdata = fs.readFileSync(filename);
let config = JSON.parse(rawdata);

const port = config.RecvPort;
const WlmRestURL = config.WlmRestURL;


log4js.configure({
    appenders: { system: { type: "file", filename: "./log/system.log" } },
    categories: { default: { appenders: ["system"], level: "info" } }
});

const logger = log4js.getLogger("system");

logger.info("starting process wlmAPI service")
var getDataFromHOST = {};

var sendSDMssage = {
    "items": [
        {
            "id": "1",
            "converter": "CSVConverter",
            "data": ""
        }]
};

var sendMssage = {
    "items": [  
        {
            "id": "1",
            "converter": "CSVConverter",
            "data": ""
        }]
};

app.use(bodyParser.json());
app.get("/api", (req, res) => {
    res.send("online");
});


app.post("/api", (req, res) => {

    getDataFromHOST = req.body;
    let HostKeyTelegram = Object.keys(getDataFromHOST);

    if (!HostKeyTelegram.includes("itemMaster") && !HostKeyTelegram.includes("storageOrder") && !HostKeyTelegram.includes("pickingOrder") && !HostKeyTelegram.includes("inventoryOrder")) {
        res.sendStatus(400).end();
        logger.error("Bad Request")
    } else {
        logger.info("recived from HOST : "+JSON.stringify(getDataFromHOST))
        var i = 1
        if (HostKeyTelegram.includes("itemMaster")) {
            const telegramAsArray = handleItemMaster(getDataFromHOST);
            sendMssage.items[0].data = getAllArray(telegramAsArray);
            postToWamas(sendMssage,WlmRestURL);
            res.send(req.body).end();
        };

        if (HostKeyTelegram.includes("storageOrder")) {
            const telegramAsArray = handleStorageOrder(getDataFromHOST);
            sendSDMssage.items[0].data = getAllArray(telegramAsArray);
            postToWamas(sendSDMssage,WlmRestURL);
            res.send(req.body).end();
        };

        if (HostKeyTelegram.includes("pickingOrder")) {
            const telegramAsArray = handlePickingOrder(getDataFromHOST);
            sendMssage.items[0].data = getAllArray(telegramAsArray);
            postToWamas(sendMssage,WlmRestURL);
            res.send(req.body).end();
        }

        if (HostKeyTelegram.includes("inventoryOrder")) {
            const telegramAsArray = handleInventoryOrder(getDataFromHOST);
            sendMssage.items[0].data = getAllArray(telegramAsArray);
            postToWamas(sendMssage,WlmRestURL);
            res.send(req.body).end();
        }

    }


});


app.use('/logs', (req, res) => {

    fs.readFile('./log/system.log', (error, txtString) => {
        if (error) throw err;
        console.log(txtString.toString());
        res.write(

            '<div id="content"><pre>' + txtString.toString() + '</pre>'
        )
    })
});



app.listen(port, (error) => {
    console.log(` api/WAMAS app listening at http://localhost:${port}`);
    logger.info(` api/WAMAS app listening at http://localhost:${port}`);

    if (error) {
        console.log(error);
        logger.error(error);
    }
});


