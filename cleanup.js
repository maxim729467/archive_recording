const { exec } = require("child_process");
const path = require("path");

const archivePath = path.join(__dirname, "/archive");
const storagePath = path.join(__dirname, "/storage");
try {
  exec(`rm -rf ${archivePath}`);
  exec(`rm -rf ${storagePath}`);
} catch (error) {
  console.log(error);
}
