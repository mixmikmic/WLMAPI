
module.exports.handleLOGIMATPDACK00005 = function(result, postToHost) {

  var itemNo;
  var batchNo;
  var orderedQty;
  var storedQty;
  var difReason;
  var SKUs = [];

var key = result.DI_TELEGRAM.header[0].FULL[0].HEADER_CREATIONTIME[0];

var xmlBody = result.DI_TELEGRAM.body[0].LOGIMATPDACK00005[0];
let demandNo = xmlBody.LogimatPickingDemand_demandNo[0];
let demandStage = xmlBody.LogimatPickingDemand_state_mainState[0]
let demandline = xmlBody.LOGIMATPDLACK00003;

demandline.forEach(element => {
  let locaion = []
  lineNo = element.LogimatPickingDemandLine_demandLineNo[0]
  itemNo = element.LogimatPickingDemandLine_sqa_pkv_Item_itemNo[0];
  batchNo = ((element.LogimatPickingDemandLine_sqa_batch) ? element.LogimatPickingDemandLine_sqa_batch[0] : "")
  variant = element.LogimatPickingDemandLine_sqa_pkv_Item_variant[0];
  csia1 = ( (element.csia1) ? element.csia1[0] : "") 
  csia2 = ( (element.csia2) ? element.csia2[0] : "") 
  csia3 = ( (element.csia3) ? element.csia3[0] : "") 
  orderedQty = element.LogimatPickingDemandLine_orderedAmount_baseQty[0];
  pickedQty = element.LogimatPickingDemandLine_deliveredAmount_baseQty[0];
  difReason = element.LogimatPickingDemandLine_diffReason[0];
  element.LOGIMATPDLACTIVITYACK00002.forEach(e=>{
    logiMat = e.LogimatPickingActivity_opening_LogimatDcCfg_logimatId[0];
    tray = e.LogimatPickingActivity_sourceTrayNo[0];
    locationId = e.LogimatPickingActivity_sourceBox_luId[0];
    user = e.LogimatPickingActivity_user[0];
    registerationTime = e.LogimatPickingActivity_registrationTime[0];
    pickedAmount = e.LogimatPickingActivity_pickedAmount_baseQty[0];
    batch_act = ((e.LogimatPickingActivity_sia_batch) ? e.LogimatPickingActivity_sia_batch[0] : "")
    csia1_act = ((e.csia1) ? e.csia1[0] : "")
    csia2_act = ((e.csia2) ? e.csia2[0] : "")
    csia3_act = ((e.csia3) ? e.csia3[0] : "")
    locaion.push({
      "locationId": locationId,
      "logimat": logiMat,
      "trayNo": tray,
      "user": user,
      "batchNo": batch_act,
      "NMPPStatus": csia1_act,
      "NMPPDate": csia2_act,
      "serialIndicator": csia3_act,
      "registerationTime": registerationTime,
      "pickedAmount": pickedAmount,
    })
  })
  SKUs.push({
    "lineNo": lineNo,
    "ItemNo": itemNo,
    "family": variant,
    "batchNo": batchNo,
    "NMPPStatus": csia1,
    "NMPPDate": csia2,
    "serialIndicator": csia3,
    "difReason": difReason,
    "orderedQty": orderedQty,
    "pickedQty": pickedQty,
    "location": locaion
  })
});

let pickingOrderack = []
let messge = {
  "key" : key,
  "OrderNo": demandNo,
  "mainStage": demandStage,
  "orderLine": SKUs
}

let AckMessage = {"pickingOrderack" : messge }
console.log(AckMessage, messge);
postToHost(AckMessage)


}