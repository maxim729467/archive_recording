const fs = require("fs");
const getFolderSize = require("fast-folder-size");
const config = require("./config.json");
const variables = require("./variables");
const ArchiveService = require("./archiveService");
const services = [];

const checkDirectories = () => {
  if (!fs.existsSync(variables.archivePath))
    fs.mkdirSync(variables.archivePath);
  if (!fs.existsSync(variables.storagePath))
    fs.mkdirSync(variables.storagePath);
};

const createArchiveServices = () => {
  const cameras = config.RTSP_LINKS;

  cameras.forEach((camera) => {
    const archiveService = new ArchiveService(camera.link, camera.name);
    services.push(archiveService);
    archiveService.init();
  });
};

const checkSpaceLimit = () => {
  getFolderSize(variables.storagePath, (err, bytes) => {
    if (err) console.log(err);

    console.log("folder size in bytes ===>", bytes);
    console.log(
      "space limit in bytes ===>",
      variables.SPACE_LIMIT * variables.gigabyte
    );

    if (bytes > variables.SPACE_LIMIT * variables.gigabyte) {
      console.log("cleaning space...");

      services.forEach((service) => {
        service.clearSpace();
      });
    }
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
