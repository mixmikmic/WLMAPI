const config = require('../config.json');

const webhookURL = config.inventoryOrderAcknowledgement;

module.exports.handleLOGIMATINVACK00005 = function(result, postToHost) {

            var xmlBody = result.DI_TELEGRAM.body[0].LOGIMATPDACK00005[0];
            let demandNo = xmlBody.LogimatPickingDemand_demandNo[0];
            let demandStage = xmlBody.LogimatPickingDemand_state_mainState[0]
            let demandline = xmlBody.LOGIMATPDLACK00003;
            demandline.forEach(element => {
              itemNo = element.LogimatPickingDemandLine_sqa_pkv_Item_itemNo[0];
              batchNo = element.LogimatPickingDemandLine_sqa_batch[0];
              prodDate = element.LogimatPickingDemandLine_sqa_prodDate[0];
              orderedQty = element.LogimatPickingDemandLine_orderedAmount_baseQty[0];
              pickedQty = element.LogimatPickingDemandLine_deliveredAmount_baseQty[0];
              difReason = element.LogimatPickingDemandLine_diffReason[0];


              SKUs.push({
                "ItemNo": itemNo,
                "batchNo": batchNo,
                "prodDate": prodDate,
                "difReason": difReason,
                "orderedQty": orderedQty,
                "pickedQty": pickedQty
              })
            });

            let pickingOrderack = []
            let message = {
              "OrderNo": demandNo,
              "mainStage": demandStage,
              "SKUs": SKUs
            }
         
            let AckMessage = { "key" : key, "InventoryOrderack" : message }
            postToHost(AckMessage, webhookURL)


}