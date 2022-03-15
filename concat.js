const { spawn } = require("child_process");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

const variables = require("./variables");

const {
  clearArchive,
  createAndFillStorage,
  removeInstruction,
} = require("./methods");

const concatSlices = () => {
  const stamp = moment().format("YYYY-MM-DD HH:mm:ss");
  const currentTimestamp = `${stamp.split(" ").join("_")}.mp4`;
  const currentPath = path.join(__dirname, currentTimestamp);
  const destinationPath = path.join(__dirname, "storage", currentTimestamp);

  const ffmpegArgs =
    `-f concat -i ${variables.instruction} -c copy ${currentTimestamp}`.split(
      " "
    );
  try {
    const child = spawn("ffmpeg", ffmpegArgs);

    child.stdout.on("data", (data) => {
      process.stdout.write(data.toString());
    });

    child.stderr.on("data", (data) => {
      process.stdout.write(data.toString());
    });

    child.on("close", (code) => {
      // console.log("concatenating process finished with code " + code);

      if (code === 0) {
        createAndFillStorage(currentPath, destinationPath);
        clearArchive();
      }
      removeInstruction();
    });
  } catch (error) {
    console.log(error);
    removeInstruction();
  }
};

const mergeSlices = () => {
  const txtFileContent = [];

  fs.readdir(variables.archivePath, function (err, files) {
    if (err) return console.log("Unable to scan directory: " + err);

    files.forEach((file) => {
      const extCheck = /.ts$/gi;
      if (!extCheck.test(file)) return;

      const slicePath = `file temp_archive/${file}`;
      txtFileContent.push(slicePath);
    });

    const instructor = fs.createWriteStream(variables.instruction, {
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
