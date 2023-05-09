const invTelegram = require('../component/LOGIMATINVD00005.json');
const papa = require('papaparse');

function inventoryOrderHandler(getDataFromHOST, logger) {
    var telegramAsArray = [];
    getDataFromHOST.inventoryOrder.forEach(element => {
        let hostTelegram = element;
        let Template = invTelegram.LOGIMATINVD00005;

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
            Template2.Serialnumber = i++;
            Template2.sysPartnerLine = lineNo++;
            Template2.prodDateFrom = elements.prodDateFrom;
            Template2.prodDateTo = elements.prodDateTo;
            Template2.batch = elements.BatchNo;

            var csvData2 = [Template2];
            var csv2 = papa.unparse(csvData2);
            var inventoryDemandLine = csv2 + "\r";
            telegramAsArray.push(inventoryDemandLine);
        });
    });

    return telegramAsArray;
}

module.exports = { inventoryOrderHandler };
