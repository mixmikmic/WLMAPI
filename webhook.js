const xml2js = require('xml2js');
const request = require('request');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "ATTR" });
const config = require('./config.json');
const { handleLOGIMATSDACK00004 } = require('./acknowledgmentHandler/LOGIMATSDACK00004Handler');
const { handleLOGIMATPDACK00005 } = require('./acknowledgmentHandler/LOGIMATPDACK00005Handler');
const { handleLOGIMATINVDACK00003 } = require('./acknowledgmentHandler/LOGIMATINVDACK00003Handler');
const { postToHost } = require('./utils/postToHost');
const { scanFolder } = require('./utils/scanFolder');
const log4js = require("log4js");

log4js.configure({
  appenders: { system: { type: "file", filename: "./log/system.log" } },
  categories: { default: { appenders: ["system"], level: "info" } }
});

const logger = log4js.getLogger("system");


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



          if (recordType == "LOGIMATSDACK00004") {
            handleLOGIMATSDACK00004(result, postToHost);
            console.log("storage");
          };

          if (recordType == "LOGIMATPDACK00005") {
            handleLOGIMATPDACK00005(result, postToHost);
            console.log("pick");

          };

          if (recordType == "LOGIMATINVDACK00003") {
            handleLOGIMATINVDACK00003(result, postToHost);
          };
        }
        else {
          console.log(error);
          logger.error(error);
        }
      });

      let archiveFolder = outboxArchivePATH + filename;
      fs.rename(xmlPATH, archiveFolder, (err) => {
        if (err) throw err
        
        console.log('Successfully renamed - AKA moved!')
        logger.info(`Successfully move file ${filename} to archive`);
      });

    }
  }, function (err) {
    throw err;
  });

  // console.log("interval");
}, interval);