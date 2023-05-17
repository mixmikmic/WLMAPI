const config = require('../config.json');

const webhookURL = config.inventoryOrderAcknowledgement;

module.exports.LOGIMATINVDACK00003 = function(result, postToHost) {
            var xmlBody = result.DI_TELEGRAM.body[0].LOGIMATINVDACK00003[0];
            let demandNo = xmlBody.LogimatInventoryDemandLine_demand_demandNo[0];
            // let demandStage = xmlBody.LogimatPickingDemand_state_mainState[0]
            let demandline = xmlBody.LOGIMATINVDLACK00003;
            console.log(xmlBody);

            demandline.forEach(element => {

              itemNo = element.LogimatPickingDemandLine_sqa_pkv_Item_itemNo[0];
              batchNo = element.LogimatPickingDemandLine_sqa_batch[0];
              prodDate = element.LogimatPickingDemandLine_sqa_prodDate[0];
              orderedQty = element.LogimatPickingDemandLine_orderedAmount_baseQty[0];
              pickedQty = element.LogimatPickingDemandLine_deliveredAmount_baseQty[0];


              SKUs.push({
                "zone": zone,
                "lineNo": lineNo,
                "account": client,
                "ItemNo": itemNo,
                "family": variant,
                "batchNo": batchNo,
                "NMPPStatus": csia1,
                "NMPPDate": csia2,
                "location": locaion,
                "serialIndicator": csia3,
                "basedQty": parseInt(orderedQty),
                "countedQty": parseInt(storedQty),
              })
            });

            let pickingOrderack = []
            let message = {
              "OrderNo": demandNo,
              "mainStage": demandStage,
              "SKUs": SKUs
            }
         
            let AckMessage = { "key" : key, "InventoryOrderack" : message }
            console.log(AckMessage, messge);
            postToHost(AckMessage, webhookURL)


}