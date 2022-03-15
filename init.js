const { spawn } = require("child_process");
const fs = require("fs");

const variables = require("./variables");
const { mergeSlices } = require("./concat");
const { checkSpaceLimit, exit } = require("./methods");

const setIntervals = () => {
  setInterval(() => {
    checkSpaceLimit();
  }, variables.SPACE_CHECK_INTERVAL);

  setInterval(() => {
    mergeSlices();
  }, variables.CONCAT_INTERVAL);
};

const startRecording = () => {
  try {
    console.log("");
    console.log("");
    console.log("");
    console.log("starting recording process...");

    const ffmpegArgs =
      `-stimeout 5000000 -loglevel error -rtsp_transport tcp -i ${variables.RTSP_LINK} -threads 1 -shortest -fflags shortest -c:v libx264 -profile:v main -crf 26 -preset veryfast -strict -2 -hls_time ${variables.SLICE_DURATION} -hls_start_number_source datetime -loglevel error -hls_flags append_list+program_date_time -master_pl_name output.m3u8 -strftime 1 -use_localtime 1 -hls_segment_filename ${variables.archivePath}/slice_%Y-%m-%d_%H-%M-%S.ts ${variables.archivePath}/stream.m3u8`.split(
        " "
      );

    const child = spawn("ffmpeg", ffmpegArgs);
    child.stdout.on("data", (data) => {
      process.stdout.write(data.toString());
    });

    child.stderr.on("data", (data) => {
      process.stdout.write(data.toString());
    });

    child.on("close", (code) => {
      console.log("recording process finished with code " + code);

      if (code !== 0) return;
      exit();
    });
  } catch (error) {
    console.log(error);
    exit();
  }
};

const init = () => {
  if (!fs.existsSync(variables.archivePath))
    fs.mkdirSync(variables.archivePath);

  console.log("establishing connection with RTSP stream...");

  let isRecordingTriggered = false;

  const ffprobeArgs =
    `-stimeout 20 -v quiet -print_format json -show_format -show_streams ${variables.RTSP_LINK}`.split(
      " "
    );
  try {
    const child = spawn("ffprobe", ffprobeArgs);

    child.stdout.on("data", (data) => {
      process.stdout.write(data.toString());
      if (isRecordingTriggered) return;
      startRecording();
      isRecordingTriggered = true;
    });

    child.stderr.on("data", (data) => {
      process.stdout.write(data.toString());
      init();
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log("connection is successful");
        return;
      }

      console.log("connecting process finished with code " + code);
      exit();
    });
  } catch (error) {
    exit();
  }
};

module.exports = {
  init,
  setIntervals,
};
