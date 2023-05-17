const config = require('../config.json');

const webhookURL = config.inventoryOrderAcknowledgement;

module.exports.handleLOGIMATINVDACK00003 = function(result, postToHost) {
  let locaion = []
  var SKUs = [];
  var batchNo;
  var key = result.DI_TELEGRAM.header[0].FULL[0].HEADER_CREATIONTIME[0];

  var xmlBody = result.DI_TELEGRAM.body[0].LOGIMATINVDACK00003[0];
  let demandNo = xmlBody.LogimatInventoryDemand_demandNo[0];
  let demandline = xmlBody.LOGIMATINVDLACK00003;
  let stockAck = xmlBody.LOGIMATSTOCKACK00005;
  let stockQty 
  let countedQty 
  let diffQty 

    demandline.forEach(element => {

              lineNo = element.LogimatInventoryDemandLine_sysPartnerLine[0]
              zone = element.LogimatInventoryDemandLine_res_wh_zone[0];
              client = element.LogimatInventoryDemandLine_res_item_item_Client_clientId[0];
              itemNo = element.LogimatInventoryDemandLine_res_item_item_itemNo[0];
              variant = element.LogimatInventoryDemandLine_res_item_item_variant[0];
              
              csia1 = ( (element.csia1) ? element.csia1[0] : "") 
              csia2 = ( (element.csia2) ? element.csia2[0] : "") 
              csia3 = ( (element.csia3) ? element.csia3[0] : "") 




              SKUs.push({
                "zone": zone,
                "account": client,
                "lineNo": lineNo,
                "ItemNo": itemNo,
                "family": variant,
                "batchNo": "",
                "NMPPStatus": csia1,
                "NMPPDate": csia2,
                "serialIndicator": csia3,
                "location": locaion,
                // "basedQty": parseInt(basedQty),
                // "countedQty": parseInt(countedQty),
              })
            });


            stockAck.forEach(e=>{
              line = e.StockReportRequest_id[0];
              locationId = e.StockObject_StockObjectBundle_luId;
              batchNo = e.StockObject_sia_batch;
              stockQty = countedQty - diffQty
              countedQty = parseInt(e.StockObject_amount_baseQty[0]);
              diffQty =  parseInt(e.StockObject_amount_difference[0]);

              SKUs[line].batchNo = batchNo
            })

            console.log(stockAck);
            console.log(SKUs);
            let pickingOrderack = []
            let message = {
              "key": key,
              "OrderNo": demandNo,
              "orderLine": SKUs
            }



         
            let AckMessage = {"inventoryAck" : message }

            console.log(AckMessage);
            // postToHost(AckMessage, webhookURL)


}