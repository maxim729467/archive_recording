const { exec } = require("child_process");
const { archivePath, storagePath } = require("./variables");

try {
  exec(`rm -rf ${archivePath}`);
  exec(`rm -rf ${storagePath}`);
} catch (error) {
  console.log(error);
}
