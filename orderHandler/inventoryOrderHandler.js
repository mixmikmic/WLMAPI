const invTelegram = require('../component/LOGIMATINVD00005.json');
const papa = require('papaparse');

function handleInventoryOrder(getDataFromHOST, logger) {
    let i = 1;
    let telegramAsArray = [];

    getDataFromHOST.inventoryOrder.forEach(element => {
        let hostTelegram = element;
        let Template = invTelegram.LOGIMATINVD00005;

        Template.demandNo = hostTelegram.orderNo;
        Template.clientId = hostTelegram.account;
        Template.Serialnumber = i++;

        var csvData = [Template];
        var csv = papa.unparse(csvData);
        var inventoryDemand = csv + "\r\n";
        var lineNo = 1;
        telegramAsArray.push(inventoryDemand);
        hostTelegram.orderline.forEach(elements => {
            let Template2 = invTelegram.LOGIMATINVDL00003;
            Template2.itemNo = elements.itemNo;
            Template2.demandNo = hostTelegram.orderNo;
            Template2.Serialnumber = i++;
            Template2.sysPartnerLine = elements.lineNo;
            Template2.batch = elements.BatchNo;
            Template2.variant = elements.family;
            Template2.batch = elements.batchNo;

            Template2.csiaStockMode01 = elements.NMPPStatus;
            Template2.csiaStockMode02 = elements.NMPPDate;
            Template2.csiaStockMode03 = elements.serialIndicator;

            var csvData2 = [Template2];
            var csv2 = papa.unparse(csvData2);
            var inventoryDemandLine = csv2 + "\r\n";
            telegramAsArray.push(inventoryDemandLine);
        });
    });
    console.log(telegramAsArray);
    return telegramAsArray;
}

module.exports = { handleInventoryOrder };
