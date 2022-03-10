const { exec } = require("child_process");
const path = require("path");

const archivePath = path.join(__dirname, "/archive");
try {
  exec(`rm -rf ${archivePath}`);
} catch (error) {
  console.log(error);
}