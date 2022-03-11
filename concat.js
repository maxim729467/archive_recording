const { spawn, execSync } = require("child_process");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const mv = require("mv");

const archivePath = path.join(__dirname, "./archive");
const storagePath = path.join(__dirname, "./storage");
const instruction = "concat.txt";
let currentPath, destinationPath;

const clearArchive = () => {
  try {
    execSync(`rm -rf ${archivePath}`);
    fs.mkdirSync(archivePath);
  } catch (error) {
    console.log(error);
  }
};

const removeInstruction = () => {
  fs.unlinkSync(path.join(__dirname, `/${instruction}`));
};

const moveFile = () => {
  mv(currentPath, destinationPath, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully moved the file!");
    }
  });
};

const createAndFillStorage = () => {
  if (!fs.existsSync(storagePath)) {
    fs.mkdir(storagePath, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      moveFile();
    });
    return;
  }

  moveFile();
};

const concatSlices = () => {
  console.log("concatenating...");

  const stamp = moment().format("YYYY-MM-DD HH:mm:ss");
  const currentTimestamp = `${stamp.split(" ").join("_")}.mp4`;

  currentPath = path.join(__dirname, currentTimestamp);
  destinationPath = path.join(__dirname, "storage", currentTimestamp);

  const ffmpegArgs =
    `-f concat -i ${instruction} -c copy ${currentTimestamp}`.split(" ");
  try {
    const child = spawn("ffmpeg", ffmpegArgs);

    child.stdout.on("data", function (data) {
      process.stdout.write(data.toString());
      console.log("success");
    });

    child.stderr.on("data", function (data) {
      process.stdout.write(data.toString());
      console.log("error");
    });

    child.on("close", function (code) {
      console.log("concatenating process finished with code " + code);

      if (code === 0) {
        removeInstruction();
        createAndFillStorage();
        clearArchive();
      }
    });
  } catch (error) {
    console.log("caught error ===>", error);
  }
};

const mergeSlices = () => {
  const txtFileContent = [];

  fs.readdir(archivePath, function (err, files) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }

    files.forEach(function (file) {
      const extCheck = /.ts$/gi;
      if (!extCheck.test(file)) return;

      const slicePath = `file archive/${file}`;
      txtFileContent.push(slicePath);
    });

    const instructor = fs.createWriteStream(instruction, {
      flags: "a",
    });

    txtFileContent.forEach((line, index) => {
      if (!index) instructor.write(line);
      instructor.write(`\n${line}`);
    });

    instructor.end();
    concatSlices();
  });
};

module.exports = {
  mergeSlices,
};
