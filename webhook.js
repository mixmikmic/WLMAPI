const xml2js = require('xml2js');
const request = require('request');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "ATTR" });
const config = require('./config.json');
const { handleLOGIMATSDACK00004 } = require('./acknowledgmentHandler/LOGIMATSDACK00004Handler');
const { handleLOGIMATPDACK00005 } = require('./acknowledgmentHandler/LOGIMATPDACK00005Handler');
const { handleLOGIMATINVACK00005 } = require('./acknowledgmentHandler/LOGIMATINVACK00005Handler');
const { postToHost } = require('./utils/postToHost');
const { scanFolder } = require('./utils/scanFolder');


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
            handleLOGIMATSDACK00004(result, postToHost);
          };

          if (recordType == "LOGIMATPDACK00005") {
            handleLOGIMATPDACK00005(result, postToHost);
          };

          if (recordType == "LOGIMATINVACK00005") {
            handleLOGIMATINVACK00005(result, postToHost);
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