const path = require("path");
const config = require("./config/config.json");

const RTSP_LINKS = config.RTSP_LINKS;
const SPACE_LIMIT = config.SPACE_LIMIT;
const SPACE_CHECK_INTERVAL = config.SPACE_CHECK_INTERVAL * 60 * 1000;
const CONCAT_INTERVAL = config.CONCAT_INTERVAL * 60 * 1000;
const SLICE_DURATION = config.SLICE_DURATION;

const gigabyte = 1073741824;
const archivePath = path.join(__dirname, "/temp_archive");
const storagePath = path.join(__dirname, "./storage");

module.exports = {
  RTSP_LINKS,
  SPACE_LIMIT,
  SPACE_CHECK_INTERVAL,
  CONCAT_INTERVAL,
  SLICE_DURATION,
  gigabyte,
  archivePath,
  storagePath,
};
