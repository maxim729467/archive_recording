const path = require("path");
const config = require("./config.json");

const RTSP_LINK = config.RTSP_LINK;
const SPACE_LIMIT = config.SPACE_LIMIT;
const SPACE_CHECK_INTERVAL = config.SPACE_CHECK_INTERVAL * 60 * 1000;
const CONCAT_INTERVAL = config.CONCAT_INTERVAL * 60 * 1000;
const SLICE_DURATION = config.SLICE_DURATION;

const gigabyte = 1073741824;
const archivePath = path.join(__dirname, "/temp_archive");
const storagePath = path.join(__dirname, "./storage");
const instruction = "concat.txt";

module.exports = {
  RTSP_LINK,
  SPACE_LIMIT,
  SPACE_CHECK_INTERVAL,
  CONCAT_INTERVAL,
  SLICE_DURATION,
  gigabyte,
  archivePath,
  storagePath,
  instruction,
};
