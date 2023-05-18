const config = require('../config.json');

const webhookURL = config.inventoryOrderAcknowledgement;

module.exports.handleLOGIMATINVDACK00003 = function(result, postToHost) {
  var SKUs = [];
  let batchNo;
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
                "itemNo": itemNo,
                "family": variant,
                "batchNo": "",
                "NMPPStatus": csia1,
                "NMPPDate": csia2,
                "serialIndicator": csia3,
                "location": [],
              })
            });

            stockAck.forEach(e=>{
              let locaion = []

              line = e.StockReportRequest_id[0];
              locationId = e.StockObject_StockObjectBundle_luId[0];
              itemNo = e.StockObject_sia_pkv_Item_itemNo[0];
              family = e.StockObject_sia_pkv_Item_variant[0];
              batchNo = ( (e.StockObject_sia_batch[0]) ? e.StockObject_sia_batch[0] : "") 
              csia1 = ( (e.StockObject_sia_csia_csia01) ? e.StockObject_sia_csia_csia01[0] : "") 
              csia2 = ( (e.StockObject_sia_csia_csia02) ? e.StockObject_sia_csia_csia02[0] : "") 
              csia3 = ( (e.StockObject_sia_csia_csia03) ? e.StockObject_sia_csia_csia03[0] : "") 
              countedQty = parseInt(e.StockObject_amount_baseQty[0]);
              diffQty =  parseInt(e.StockObject_amount_difference[0]);
              stockQty = countedQty - diffQty;
              SKUs[line-1].batchNo = batchNo
             SKUs[line-1].location.push({
                  "locationId" : locationId,
                  "itemNo" : itemNo,
                  "family" : family,
                  "NMPPStatus": csia1,
                  "NMPPDate": csia2,
                  "serialIndicator": csia3,                
                  "stockQty": stockQty,
                  "countedQty" : countedQty,
                  "diffQty": diffQty
                })
             })
            
              

       

            console.log(SKUs);
            console.log(SKUs[0]);
            console.log(SKUs[1]);

            let pickingOrderack = []
            let message = {
              "key": key,
              "OrderNo": demandNo,
              "orderLine": SKUs
            }



         
            let AckMessage = {"inventoryAck" : message }
            postToHost(AckMessage, webhookURL)


}