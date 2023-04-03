const xml2js = require('xml2js');
const request = require('request');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "ATTR" });
const config = require('./config.json');

const webhookURL = config.webhookURL;
const outboxPATH = config.outboxPATH;
const outboxArchivePATH = config.outboxArchivePATH;
const interval = config.interval;

var data = {};

setInterval(() => {

  scanFolder(outboxPATH, (filename, content) => {


    if (filename.includes("ACK")) {
      // console.log(filename);
      data[filename] = content;
      let xmlPATH = outboxPATH + filename;
      let xml_string = fs.readFileSync(xmlPATH, "utf8");

      parser.parseString(xml_string, (error, result) => {
        if (error === null) {
          var recordType = result.DI_TELEGRAM.header[0].FULL[0].HEADER_RECORDTYPENAME[0];

          var itemNo;
          var batchNo;
          var orderedQty;
          var storedQty;
          var difReason;
          var SKUs = [];

          var key = result.DI_TELEGRAM.header[0].FULL[0].HEADER_CREATIONTIME[0];
          // console.log(recordType);

          if (recordType == "LOGIMATSDACK00004") {

            // console.log(xmlBody);
            var xmlBody = result.DI_TELEGRAM.body[0].LOGIMATSDACK00004[0];
            let demandNo = xmlBody.LogimatStorageDemand_demandNo[0];
            let NoteNo = xmlBody.LogimatStorageDemand_noteNo[0];
            let demandStage = xmlBody.LogimatStorageDemand_state_mainState[0]
            let demandline = xmlBody.LOGIMATSDLACK00003;

            demandline.forEach(element => {
              let locaion = []
              lineNo = element.LogimatStorageDemandLine_demandLineNo[0]
              itemNo = element.LogimatStorageDemandLine_sqa_pkv_Item_itemNo[0];
              batchNo = ((element.LogimatStorageDemandLine_sqa_batch) ? element.LogimatStorageDemandLine_sqa_batch[0] : "")
              variant = element.LogimatStorageDemandLine_sqa_pkv_Item_variant[0];
              orderedQty = element.LogimatStorageDemandLine_orderedAmount_baseQty[0];
              storedQty = element.LogimatStorageDemandLine_deliveredAmount_baseQty[0];
              csia1 = ( (element.csia1) ? element.csia1[0] : "") 
              csia2 = ( (element.csia2) ? element.csia2[0] : "") 
              csia3 = ( (element.csia3) ? element.csia3[0] : "") 
              difReason = element.LogimatStorageDemandLine_diffReason[0];
              element.LOGIMATSDLACTIVITYACK00001.forEach(e=>{
                logiMat = e.LogimatStorageActivity_opening_LogimatDcCfg_logimatId[0];
                tray = e.LogimatStorageActivity_destTrayNo[0];
                locationId = e.LogimatStorageActivity_destStockObject_luId[0];
                user = e.LogimatStorageActivity_user[0];
                registerationTime = e.LogimatStorageActivity_registrationTime[0];
                storedAmount = e.LogimatStorageActivity_storedAmount_baseQty[0];
                locaion.push({
                  "locationId": locationId,
                  "logimat": logiMat,
                  "trayNo": tray,
                  "user": user,
                  "registerationTime": registerationTime,
                  "storedAmount": storedAmount,
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
                "storedQty": storedQty,
                "location": locaion
              })
            });

            let storageOrderack = []
            let messge = {
              "key" : key,
              "orderNo": demandNo,
              "noteNo" : NoteNo,
              "mainStage": demandStage,
              "orderLine": SKUs
            }
         
            let AckMessage = {"storageOrderack" : messge }
            postToHost(AckMessage)


          };

          if (recordType == "LOGIMATPDACK00005") {

            // console.log(xmlBody);

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
            postToHost(AckMessage)


          };

          if (recordType == "LOGIMATINVACK00005") {

            // console.log(xmlBody);

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
            let messge = {
              "OrderNo": demandNo,
              "mainStage": demandStage,
              "SKUs": SKUs
            }
         
            let AckMessage = { "key" : key, "pickingOrderack" : messge }
            postToHost(AckMessage)


          };
 
 

        }
        else {
          console.log(error);
        }
      });

      let archiveFolder = outboxArchivePATH + filename;
      fs.rename(xmlPATH, archiveFolder, (err) => {
        if (err) throw err
        console.log('Successfully renamed - AKA moved!')
      });

    }
  }, function (err) {
    throw err;
  });

  // console.log("interval");
}, interval);




function postToHost(sendMssage) { 
  request.post(
  webhookURL,
  {
    json: sendMssage,
  },
  (error, res, body) => {
    if (error) {
      console.error(error)
      return
    }
  if (!error){
    console.log(`statusCode: ${res.statusCode}`)
    console.log(body);
  }
  }
);
}


function scanFolder(dirname, onFileContent, onError) {
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function (filename) {
      fs.readFile(dirname + filename, 'utf-8', function (err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
}
