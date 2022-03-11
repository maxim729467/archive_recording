const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const getFolderSize = require("fast-folder-size");
const config = require("./config.json");
const { mergeSlices } = require("./concat");

const RTSP_LINK = config.RTSP_LINK;
const SPACE_LIMIT = config.SPACE_LIMIT;
const SPACE_CHECK_INTERVAL = config.SPACE_CHECK_INTERVAL * 60 * 1000;
const CONCAT_INTERVAL = config.CONCAT_INTERVAL * 60 * 1000;
const SLICE_DURATION = config.SLICE_DURATION;

const gigabyte = 1073741824;
const archivePath = path.join(__dirname, "/archive");
const storagePath = path.join(__dirname, "./storage");
let isRecordingTriggered = false;

const clearSpace = () => {
  fs.readdir(storagePath, (err, files) => {
    if (err) return console.log("Unable to scan directory: " + err);

    const numberOfFilesToRemove = Math.ceil(files.length / 5);

    files.forEach((file, index) => {
      if (index + 1 > numberOfFilesToRemove) return;
      fs.unlinkSync(path.join(storagePath, `/${file}`));
    });
  });
};

if (!fs.existsSync(archivePath)) {
  fs.mkdirSync(archivePath);
}

setInterval(() => {
  getFolderSize(archivePath, (err, bytes) => {
    if (err) console.log(err);

    console.log("folder size in bytes ===>", bytes);
    console.log("space limit in bytes ===>", SPACE_LIMIT * gigabyte);

    if (bytes > SPACE_LIMIT * gigabyte) {
      console.log("cleaning space...");
      clearSpace();
    }
  });
}, SPACE_CHECK_INTERVAL);

setInterval(() => {
  mergeSlices();
}, CONCAT_INTERVAL);

const startRecording = () => {
  try {
    console.log("");
    console.log("");
    console.log("");
    console.log("starting recording process...");

    const ffmpegArgs =
      `-stimeout 5000000 -loglevel error -rtsp_transport tcp -i ${RTSP_LINK} -threads 1 -shortest -fflags shortest -c:v libx264 -profile:v main -crf 26 -preset veryfast -strict -2 -hls_time ${SLICE_DURATION} -hls_start_number_source datetime -loglevel error -hls_flags append_list+program_date_time -master_pl_name output.m3u8 -strftime 1 -use_localtime 1 -hls_segment_filename ${archivePath}/slice_%Y-%m-%d_%H-%M-%S.ts ${archivePath}/stream.m3u8`.split(
        " "
      );

    const child = spawn("ffmpeg", ffmpegArgs);
    child.stdout.on("data", function (data) {
      process.stdout.write(data.toString());
    });

    child.stderr.on("data", function (data) {
      process.stdout.write(data.toString());
    });

    child.on("close", function (code) {
      console.log("recording process finished with code " + code);

      if (code !== 0) return;
      startRecording();
    });
  } catch (error) {
    console.log(error);
  }
};

const connectToCamera = () => {
  console.log("establishing connection with RTSP stream...");
  const ffprobeArgs =
    `-stimeout 20 -v quiet -print_format json -show_format -show_streams ${RTSP_LINK}`.split(
      " "
    );
  try {
    const child = spawn("ffprobe", ffprobeArgs);

    child.stdout.on("data", function (data) {
      process.stdout.write(data.toString());
      if (isRecordingTriggered) return;
      startRecording();
      isRecordingTriggered = true;
    });

    child.stderr.on("data", function (data) {
      process.stdout.write(data.toString());
      probeStream();
    });

    child.on("close", function (code) {
      if (code === 0) {
        console.log("connection is successful");
        return;
      }

      console.log("connecting process finished with code " + code);
    });
  } catch (error) {
    probeStream();
  }
};

connectToCamera();
