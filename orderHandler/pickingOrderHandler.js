const pdTelegram = require('../component/LOGIMATPD00004.json');
const papa = require('papaparse');

function handlePickingOrder(getDataFromHOST, logger) {
    let i = 1;
    let telegramAsArray = [];
    getDataFromHOST.pickingOrder.forEach(element => {
        let hostTelegram = element;
        if (!element.orderNo) {
            throw new Error("Bad Request: Missing orderNo in pickingOrder");
        } else {
            let Template = pdTelegram.LOGIMATPD00004;

            Template.demandNo = hostTelegram.orderNo;
            Template.extRef = hostTelegram.extRef;
            Template.noteNo = hostTelegram.noteNo;
            Template.zone = hostTelegram.zone;
            Template.info = hostTelegram.info;
            Template.Info2 = hostTelegram.info2;
            Template.Serialnumber = i++;
            Template.clientId = hostTelegram.account;

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
                telegramAsArray.push(pickingDemandLine);
            });
        }
    });
    
    return telegramAsArray;
}

module.exports = { handlePickingOrder };
