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
        },
        {
            "id": "2",
            "converter": "CSVConverter",
            "data": ""
        },
        {
            "id": "3",
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
    let HostKeyTelegram = Object.keys(getDataFromHOST);

    if (!HostKeyTelegram.includes("itemMaster") && !HostKeyTelegram.includes("StorageOrders") && !HostKeyTelegram.includes("PickingOrders") && !HostKeyTelegram.includes("InventoryOrder")) {
        res.sendStatus(400).end();
        logger.error("Bad Request")
    } else {

        logger.info("recived from HOST : "+JSON.stringify(getDataFromHOST))
        var i = 1
        if (HostKeyTelegram.includes("ItemMaster")) {
            var telegramAsArray = [];
            getDataFromHOST.ItemMaster.forEach(element => {
                let Template = itemTelegram.LOGIMATITEM00006;
                let Template2 = itemTelegram.LOGIMATITEMDESC00002;
                let Template3 = itemTelegram.LOGIMATITEMALIAS00003;
                let hostTelegram = element;
                Template.clientId = Template2.clientId = Template3.clientId =hostTelegram.client; 
                Template.Item_itemNo = Template2.Item_itemNo = Template3.Item_itemNo = hostTelegram.ItemNo;
                Template3.itemAliasNo = hostTelegram.UPCid ;
                Template.Serialnumber = i++;
                Template2.Serialnumber = i++;
                Template3.Serialnumber = i++;
                Template2.Description1 = hostTelegram.Description1;
                Template2.Description2 = hostTelegram.Description2;

                var csvData1 = [itemTelegram.LOGIMATITEM00006];
                var csvData2 = [itemTelegram.LOGIMATITEMDESC00002]
                var csvData3= [itemTelegram.LOGIMATITEMALIAS00003]
                var csv1 = papa.unparse(csvData1);
                var csv2 = papa.unparse(csvData2);
                var csv3 = papa.unparse(csvData3);
                var data = csv1 + "\r" + csv2 + "\r"+csv3+"\r" ;
                telegramAsArray.push(data);
            })
            sendMssage.items[0].data = getAllArray(a);
            postToWamas(sendMssage);
            res.send(req.body).end();
        };

        if (HostKeyTelegram.includes("StorageOrders")) {
            var telegramAsArray = [];
            var itemArray = [];

            getDataFromHOST.StorageOrders.forEach(element => {
                let Template = itemTelegram.LOGIMATITEM00006;
                let Template2 = itemTelegram.LOGIMATITEMDESC00002;
                let Template3 = itemTelegram.LOGIMATITEMALIAS00003;
                let Template4 = itemTelegram.LOGIMATQTYUNIT00001;
                let Template5 = itemTelegram.LOGIMATITEMCUBATURE00003;
                let Template6 = itemTelegram.LOGIMATITEMCUBATURE00003A;
                let Template7 = itemTelegram.LOGIMATPKV00003;
                let hostTelegram = element;

                hostTelegram.SKUs.forEach(elements => {

                    if (!elements.ItemNo || !elements.Qty || !elements.BoxId) {
                        res.sendStatus(400).end();
                        logger.error("Bad Request")
                    } else {
                        Template.Item_itemNo = Template2.Item_itemNo = Template3.Item_itemNo = Template4.Item_itemNo = Template5.ItemNo = Template6.ItemNo = Template7.ItemNo = elements.ItemNo;
                        Template.Serialnumber = i++;
                        Template2.Serialnumber = i++;
                        Template3.Serialnumber = i++;
                        Template7.Serialnumber = i++;
                        Template4.Serialnumber = i++;
                        Template2.Description1 = elements.Description;
                        Template2.Description2 = elements.Description2;
                        Template3.itemAliasNo = elements.UPCid;
                        Template5.Varint = Template6.Varint = Template.variant=Template2.variant = Template3.variant= Template4.variant = Template7.Varint = "00000";
                        
                        if(elements.BatchNo === "R"){
                            Template5.Varint = Template6.Varint = Template.variant=Template2.variant = Template3.variant= Template4.variant =Template7.Varint = elements.BatchNo;
                            
                            Template5.Serialnumber = i++
                            Template6.Serialnumber = i++
                            Template5.boxId = "Type-3";
                            Template6.boxId = "Type-3A"
                            Template5.baseQtyMax = Template6.baseQtyMax = "9999";
                            Template5.unlimited =Template6.unlimited = "1";
                        };

                        var csvData1 = [itemTelegram.LOGIMATITEM00006];
                        var csvData2 = [itemTelegram.LOGIMATITEMDESC00002];
                        var csvData3 = [itemTelegram.LOGIMATITEMALIAS00003];
                        var csvData4 = [itemTelegram.LOGIMATQTYUNIT00001];
                        var csvData5 = [itemTelegram.LOGIMATITEMCUBATURE00003];
                        var csvData6 = [itemTelegram.LOGIMATITEMCUBATURE00003A];
                        var csvData7 = [itemTelegram.LOGIMATPKV00003];
                        var csv1 = papa.unparse(csvData1);
                        var csv2 = papa.unparse(csvData2);
                        var csv3 = papa.unparse(csvData3);
                        var csv4 = papa.unparse(csvData4);
                        var csv5 = papa.unparse(csvData5);
                        var csv6 = papa.unparse(csvData6);
                        var csv7 = papa.unparse(csvData7);

                        if ( elements.BatchNo === "R" ){
                            var itemData = csv1 + "\r\n" + csv2 + "\r\n"+csv3+"\r\n"+csv7+"\r\n"+csv4+"\r\n"+csv5+"\r\n"+csv6+"\r\n";
                            itemArray.push(itemData);
                        }
                        else {
                            var itemData = csv1 + "\r\n" + csv2 + "\r\n"+csv3+"\r\n"+csv7+"\r\n"+csv4+"\r\n";
                            itemArray.push(itemData);
                        }
                    };

                });


                hostTelegram.SKUs.forEach(elements => {
                    let Template4 = sdTelegram.LOGIMATSDL00003;
                    let Template3 = sdTelegram.LOGIMATSD00004;
                    Template3.extRef = hostTelegram.ASN;
                    Template4.variant = "00000";

                    if(elements.BatchNo === "R"){
                        Template4.variant = elements.BatchNo;
                    };


                    
                    Template3.demandNo = Template3.noteNo = elements.BoxId;
                    Template3.Serialnumber = i++;
                    var csvData3 = [sdTelegram.LOGIMATSD00004];
                    var csv3 = papa.unparse(csvData3);
                    var storageDemand = csv3 + "\r";
                    var lineNo = 1;
                    telegramAsArray.push(storageDemand);

                    Template4.csiaStockMode01 = elements.BoxId;
                    Template4.csiaStockMode02 = hostTelegram.ASN;
                    Template4.itemNo = elements.ItemNo;
                    Template4.demandNo = elements.BoxId;
                    Template4.Serialnumber = i++
                    Template4.sysPartnerLine = lineNo++
                    Template4.baseQty = elements.Qty;
                    Template4.prodDate = elements.ProdDate;
                    Template4.batch = elements.BatchNo;
                    var csvData4 = [Template4];
                    var csv4 = papa.unparse(csvData4);
                    var storageDemandLine = csv4 + "\r";
                    telegramAsArray.push(storageDemandLine)
                });

            })
            sendSDMssage.items[0].data = getAllArray(itemArray);
            sendSDMssage.items[1].data = getAllArray(itemArray);
            sendSDMssage.items[2].data = getAllArray(telegramAsArray);
            console.log(sendSDMssage);
            postToWamas(sendSDMssage);
            res.send(req.body).end();
        };

        if (HostKeyTelegram.includes("PickingOrders")) {
            var telegramAsArray = [];
            getDataFromHOST.PickingOrders.forEach(elements => {
                let hostTelegram = elements;
                if (!elements.OrderNo  ) {
                    res.sendStatus(400).end();
                    logger.error("Bad Request")
                } else {
                let Template = pdTelegram.LOGIMATPD00004;
        

                Template.demandNo = hostTelegram.OrderNo;
                Template.Serialnumber = i++;

                var csvData = [Template];
                var csv = papa.unparse(csvData);
                var pickingDemand = csv + "\r";
                var lineNo = 1;
                telegramAsArray.push(pickingDemand);
                };

                hostTelegram.OrderLine.forEach(elements => {
                    let Template2 = pdTelegram.LOGIMATPDL00003;
                    Template2.itemNo = elements.ItemNo;
                    Template2.demandNo = hostTelegram.OrderNo;
                    Template2.Serialnumber = i++
                    Template2.sysPartnerLine = lineNo++
                    Template2.baseQty = elements.Qty;
                    Template2.prodDate = elements.ProdDate;
                    Template2.batch = elements.BatchNo;
                    Template2.variant = "00000";
                    if( elements.BatchNo === "R"){
                        Template2.variant = elements.BatchNo;
                    }
            
                    var csvData2 = [Template2];
                    var csv2 = papa.unparse(csvData2);
                    var pickingDemandLine = csv2 + "\r";
                    telegramAsArray.push(pickingDemandLine)
                });

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
            console.log(`statusCode: ${res.statusCode}`);
            logger.info(`statusCode: ${res.statusCode}`);
            //   console.log(body)
        }
    ).auth("ssi", "ssi", false);
    logger.info("send telegram to WAMAS : " + JSON.stringify(sendMssage))

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


