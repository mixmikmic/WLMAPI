const pdTelegram = require('../component/LOGIMATSD00004.json');
const papa = require('papaparse');

function handleStorageOrder(getDataFromHOST) {
    let i = 1;
    let telegramAsArray = [];

    getDataFromHOST.storageOrder.forEach(element => {
        let hostTelegram = element;
        let Template = pdTelegram.LOGIMATSD00004;

        Template.demandNo = hostTelegram.orderNo;
        Template.extRef = hostTelegram.extRef;
        Template.noteNo = hostTelegram.noteNo;
        Template.zone = hostTelegram.zone;
        Template.info = hostTelegram.info;
        Template.Info2 = hostTelegram.info2;
        Template.Serialnumber = i++;
        Template.clientId = hostTelegram.account;

        const csvData = [pdTelegram.LOGIMATSD00004];
        const csv = papa.unparse(csvData);
        const storageDemand = csv + "\r\n";
        telegramAsArray.push(storageDemand);

        hostTelegram.orderline.forEach(element => {
            let Template2 = pdTelegram.LOGIMATSDL00003;

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

            const csvData2 = [Template2];
            const csv2 = papa.unparse(csvData2);
            const storageDemandLine = csv2 + "\r\n";
            telegramAsArray.push(storageDemandLine);
        });
    });

    return telegramAsArray;
}

module.exports = { handleStorageOrder };
