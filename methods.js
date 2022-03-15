const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const mv = require("mv");
const variables = require("./variables");

const exit = () => {
  process.exit();
};

const clearArchive = () => {
  try {
    execSync(`rm -rf ${variables.archivePath}`);
    fs.mkdirSync(variables.archivePath);
  } catch (error) {
    console.log(error);
  }
};

const moveFile = (currentPath, destinationPath) => {
  mv(currentPath, destinationPath, function (err) {
    if (err) {
      console.log(err);
    } else {
      //   console.log("Successfully moved the file!");
    }
  });
};

const createAndFillStorage = (currentPath, destinationPath) => {
  if (!fs.existsSync(variables.storagePath)) {
    fs.mkdir(variables.storagePath, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      moveFile(currentPath, destinationPath);
    });
    return;
  }

  moveFile(currentPath, destinationPath);
};

const removeInstruction = () => {
  fs.unlinkSync(path.join(__dirname, `/${variables.instruction}`));
};

const clearSpace = () => {
  fs.readdir(variables.storagePath, (err, files) => {
    if (err) return console.log("Unable to scan directory: " + err);

    const numberOfFilesToRemove = Math.ceil(files.length / 5);

    files.forEach((file, index) => {
      if (index + 1 > numberOfFilesToRemove) return;
      fs.unlinkSync(path.join(variables.storagePath, `/${file}`));
    });
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
      //   console.log("cleaning space...");
      clearSpace();
    }
  });
};

module.exports = {
  clearArchive,
  createAndFillStorage,
  removeInstruction,
  checkSpaceLimit,
  exit,
};
