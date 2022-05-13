const fs = require("fs");
const getFolderSize = require("fast-folder-size");
const variables = require("./variables");
const ArchiveService = require("./archiveService");
const services = [];
const { logger, logs } = require('./logger');

const checkDirectories = () => {
  if (!fs.existsSync(variables.archivePath)) fs.mkdirSync(variables.archivePath);
  if (!fs.existsSync(variables.storagePath)) fs.mkdirSync(variables.storagePath);
};

const createArchiveServices = () => {
  variables.RTSP_LINKS.forEach((camera) => {
    const archiveService = new ArchiveService(camera.link, camera.name);
    services.push(archiveService);
    archiveService.init();
  });
};

const checkSpaceLimit = () => {
  getFolderSize(variables.storagePath, (err, bytes) => {
    if (err) logger.addLog(logs.ERROR, error);

    logger.addLog(logs.DIVIDER);
    logger.addLog(logs.TIMESTAMP);
    logger.addLog(logs.INFO, "folder size in bytes ===>" + bytes);
    logger.addLog(logs.INFO, `space limit in bytes ===> ${variables.SPACE_LIMIT * variables.gigabyte}`);

    if (bytes > variables.SPACE_LIMIT * variables.gigabyte) {
      logger.addLog(logs.INFO, "cleaning space");

      services.forEach((service) => {
        service.clearSpace();
      });
    }
    logger.addLog(logs.DIVIDER);
  });
};

const init = () => {
  checkDirectories();
  createArchiveServices();

  setInterval(() => {
    checkSpaceLimit();
  }, variables.SPACE_CHECK_INTERVAL);
};

init();
