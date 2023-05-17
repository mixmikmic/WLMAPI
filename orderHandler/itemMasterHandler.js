const itemTelegram = require('../component/LOGIMATITEM00006.json');
const papa = require('papaparse');

function handleItemMaster(getDataFromHOST) {
    let i = 1;
    let telegramAsArray = [];
    getDataFromHOST.itemMaster.forEach(element => {
        console.log(element);
        let Template = itemTelegram.LOGIMATITEM00006;
        let Template2 = itemTelegram.LOGIMATITEMDESC00002;
        let Template3 = itemTelegram.LOGIMATQTYUNIT00001;
        let Template4 = itemTelegram.LOGIMATPKV00003;
        let hostTelegram = element;

        Template.Item_itemNo = Template2.Item_itemNo = Template3.Item_itemNo = Template4.ItemNo = hostTelegram.itemNo;
        Template.variant = Template2.variant = Template3.variant = Template4.Varint = hostTelegram.family;
        Template.item_baseQtyUnit_id = Template3.qtyUnit = Template3.referenceQtyUnit = Template4.whQtyUnit = hostTelegram.UOM.substring(0,5);
        Template.clientId = Template2.clientId = Template3.clientId = Template4.clientId = hostTelegram.account;
        Template.Serialnumber = i++;
        Template2.Serialnumber = i++;
        Template3.Serialnumber = i++;
        Template4.Serialnumber = i++;

        Template2.Description1 = hostTelegram.description1;
        Template2.Description2 = hostTelegram.description2;

        const csvData1 = [itemTelegram.LOGIMATITEM00006];
        const csvData2 = [itemTelegram.LOGIMATITEMDESC00002];
        const csvData3 = [itemTelegram.LOGIMATQTYUNIT00001];
        const csvData4 = [itemTelegram.LOGIMATPKV00003];

        const csv1 = papa.unparse(csvData1);
        const csv2 = papa.unparse(csvData2);
        const csv3 = papa.unparse(csvData3);
        const csv4 = papa.unparse(csvData4);

        const data = csv1 + "\r\n" + csv2 + "\r\n" + csv3 + "\r\n" + csv4 + "\r\n";
        telegramAsArray.push(data);
    });
    
    return telegramAsArray;
}

module.exports = { handleItemMaster };
