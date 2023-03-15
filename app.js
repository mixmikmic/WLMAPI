const jsoncsv = require('json-csv');
const papa = require('papaparse');
const request = require('request');
const itemTelegram = require('./component/LOGIMATITEM00006.json');
const sdTelegram = require('./component/LOGIMATSD00004.json');
const pdTelegram = require('./component/LOGIMATPD00004.json');
const invTelegram = require('./component/LOGIMATINVD00005.json');
const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const log4js = require("log4js");
const { isNull } = require('util');
const { json } = require('express');

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
var restTelegram = {    "id": "1",
                        "converter": "CSVConverter",
                        "data": ""
                 };


var sendSDMssage = {
    "items": [
        {
            "id": "1",
            "converter": "CSVConverter",
            "data": ""
        }]
};
var sendItemTelegram = {
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

    var myJSON = JSON.stringify(req.body);
    getDataFromHOST = req.body;
    console.log(getDataFromHOST);
    let HostKeyTelegram = Object.keys(getDataFromHOST);

    if (!HostKeyTelegram.includes("itemMaster") && !HostKeyTelegram.includes("storageOrder") && !HostKeyTelegram.includes("pickingOrder") && !HostKeyTelegram.includes("InventoryOrder")) {
        res.sendStatus(400).end();
        logger.error("Bad Request")
    } else {
        logger.info("recived from HOST : "+JSON.stringify(getDataFromHOST))
        var i = 1
        if (HostKeyTelegram.includes("itemMaster")) {
            var telegramAsArray = [];
            getDataFromHOST.itemMaster.forEach(element => {
                let Template = itemTelegram.LOGIMATITEM00006;
                let Template2 = itemTelegram.LOGIMATITEMDESC00002;
                let Template3 = itemTelegram.LOGIMATQTYUNIT00001;
                let Template4 = itemTelegram.LOGIMATPKV00003;
                let hostTelegram = element;
                // Template.clientId = Template2.clientId = Template3.clientId =hostTelegram.client; 
                Template.Item_itemNo = Template2.Item_itemNo = Template3.Item_itemNo = Template4.ItemNo= hostTelegram.itemNo;
                Template.variant = Template2.variant  = Template3.variant= Template4.Varint  = hostTelegram.family;
                Template.item_baseQtyUnit_id =Template3.qtyUnit = Template3.referenceQtyUnit = Template4.whQtyUnit = hostTelegram.UOM
                Template.clientId = Template2.clientId = Template3.clientId = Template4.clientId = hostTelegram.account
                Template.Serialnumber = i++;
                Template2.Serialnumber = i++;
                Template3.Serialnumber = i++;
                Template4.Serialnumber = i++;

                Template2.Description1 = hostTelegram.description1;
                Template2.Description2 = hostTelegram.description2;

                var csvData1 = [itemTelegram.LOGIMATITEM00006];
                var csvData2 = [itemTelegram.LOGIMATITEMDESC00002]
                var csvData3 = [itemTelegram.LOGIMATQTYUNIT00001]
                var csvData4 = [itemTelegram.LOGIMATPKV00003]

                var csv1 = papa.unparse(csvData1);
                var csv2 = papa.unparse(csvData2);
                var csv3 = papa.unparse(csvData3);
                var csv4 = papa.unparse(csvData4);

                var data = csv1 + "\r\n" + csv2 +"\r\n" + csv4 +"\r\n"+ csv4 +"\r\n";
                telegramAsArray.push(data);
            })
            sendMssage.items[0].data = getAllArray(telegramAsArray);
            postToWamas(sendMssage);
            res.send(req.body).end();
        };

        if (HostKeyTelegram.includes("storageOrder")) {
            var telegramAsArray = [];

            getDataFromHOST.storageOrder.forEach(element => {

                let hostTelegram = element;
                let Template = sdTelegram.LOGIMATSD00004;

                Template.demandNo = hostTelegram.orderNo;
                Template.extRef =hostTelegram.extRef;
                Template.noteNo = hostTelegram.noteNo;
                Template.zone = hostTelegram.zone;
                Template.info = hostTelegram.info;
                Template.Info2 = hostTelegram.info2;
                Template.Serialnumber = i++
                Template.clientId = hostTelegram.account

                var csvData = [sdTelegram.LOGIMATSD00004];
                var csv = papa.unparse(csvData);
                var storageDemand = csv + "\r\n";
                telegramAsArray.push(storageDemand);

                hostTelegram.orderline.forEach(element => {
                    let Template2 = sdTelegram.LOGIMATSDL00003;
                    
                    Template2.demandNo = hostTelegram.orderNo;
                    Template2.Serialnumber = i++;
                    
                    Template2.sysPartnerLine = element.lineNo;
                    Template2.itemNo = element.itemNo;
                    Template2.variant = element.family;
                    Template2.batch = element.batchNo;

                    Template2.csiaStockMode01 = element.NMPPStatus;
                    Template2.csiaStockMode02 = element.NMPPDate;
                    Template2.csiaStockMode03 = element.serialIndicator;
                    Template2.baseQty = element.qty;




                    var csvData2 = [Template2];
                    var csv2 = papa.unparse(csvData2);
                    var storageDemandLine = csv2 + "\r\n";
                    telegramAsArray.push(storageDemandLine)
                });

            })
            sendSDMssage.items[0].data = getAllArray(telegramAsArray);
            console.log(sendSDMssage);
            postToWamas(sendSDMssage);
            res.send(req.body).end();
        };

        if (HostKeyTelegram.includes("pickingOrder")) {
            var telegramAsArray = [];
            getDataFromHOST.pickingOrder.forEach(elements => {
                let hostTelegram = elements;
                if (!elements.orderNo  ) {
                    res.sendStatus(400).end();
                    logger.error("Bad Request")
                } else {
                let Template = pdTelegram.LOGIMATPD00004;
        
                Template.demandNo = hostTelegram.orderNo;
                Template.extRef =hostTelegram.extRef;
                Template.noteNo = hostTelegram.noteNo;
                Template.zone = hostTelegram.zone;
                Template.info = hostTelegram.info;
                Template.Info2 = hostTelegram.info2;
                Template.Serialnumber = i++
                Template.clientId = hostTelegram.account

                var csvData = [Template];
                var csv = papa.unparse(csvData);
                var pickingDemand = csv + "\r\n";
                telegramAsArray.push(pickingDemand);
             

                hostTelegram.orderline.forEach(element => {
                    let Template2 = pdTelegram.LOGIMATPDL00003;


                    Template2.demandNo = hostTelegram.orderNo;
                    Template2.Serialnumber = i++;
                    
                    Template2.sysPartnerLine = element.lineNo;
                    Template2.itemNo = element.itemNo;
                    Template2.variant = element.family;
                    Template2.batch = element.batchNo;

                    Template2.csiaStockMode01 = element.NMPPStatus;
                    Template2.csiaStockMode02 = element.NMPPDate;
                    Template2.csiaStockMode03 = element.serialIndicator;
                    Template2.baseQty = element.qty;
            
                    var csvData2 = [Template2];
                    var csv2 = papa.unparse(csvData2);
                    var pickingDemandLine = csv2 + "\r\n";
                    telegramAsArray.push(pickingDemandLine)
                });
            }
                
            })

            sendMssage.items[0].data = getAllArray(telegramAsArray);
        
            postToWamas(sendMssage);
            console.log(sendMssage);
            res.send(req.body).end();
        }



        if (HostKeyTelegram.includes("InventoryOrder")) {
            var telegramAsArray = [];
            getDataFromHOST.inventoryOrder.forEach(element => {
                let Template = InvTelegram.LOGIMATINVD00005;
                let hostTelegram = element;
                Template.demandNo = hostTelegram.OrderNo;
                Template.Serialnumber = i++;
                var csvData = [Template];
                var csv = papa.unparse(csvData);
                var inventoryDemand = csv + "\r";
                var lineNo = 1;
                telegramAsArray.push(inventoryDemand);

                hostTelegram.orderLine.forEach(elements => {
                    let Template2 = invTelegram.LOGIMATINVDL00003;
                    Template2.itemNo = elements.ItemNo;
                    Template2.demandNo = hostTelegram.OrderNo;
                    Template2.Serialnumber = i++
                    Template2.sysPartnerLine = lineNo++
                    Template2.prodDateFrom = elements.prodDateFrom;
                    Template2.prodDateTo = elements.prodDateTo;
                    Template2.batch = elements.BatchNo;
                    var csvData2 = [Template2];
                    var csv2 = papa.unparse(csvData2);
                    var inventoryDemandLine = csv2 + "\r";
                    telegramAsArray.push(inventoryDemandLine)
                });

            })

            sendMssage.items[0].data = getAllArray(telegramAsArray);

            postToWamas(sendMssage);
            res.send(req.body).end();
        }

    }


});



function postToWamas(sendMssage) {
    request.post(
        WlmRestURL,
        {
            json: sendMssage,
        },
        (error, res, body) => {
            if (error) {
                console.error(error)
                logger.error(error);
                return
            }
            console.log(`statusCode: ${res.statusCode}`, res.body);
            logger.info(`statusCode: ${res.statusCode}`);
            //   console.log(body)
        }
    ).auth("ssi", "ssi", false);
    logger.info("send telegram to WAMAS : " + JSON.stringify(sendMssage))

}

function checkConnection(){
    request
}

function getAllArray(array) {
    var data = "";
    for (var i = 0; i < array.length; i++) {
        data += array[i];
    }
    return data;
};


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


