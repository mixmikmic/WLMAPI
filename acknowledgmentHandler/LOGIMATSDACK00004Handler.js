
module.exports.handleLOGIMATSDACK00004 = function(result, postToHost) {


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

        }