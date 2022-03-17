const { execSync, spawn } = require("child_process");
const path = require("path");
const moment = require("moment");
const fs = require("fs");
const mv = require("mv");
const kill = require("tree-kill");
const variables = require("./variables");

class ArchiveService {
  constructor(link, name) {
    this.link = link;
    this.name = name;
    this.archivePath = `${variables.archivePath}/${name}`;
    this.storagePath = `${variables.storagePath}/${name}`;
    this.instruction = `concat_${name}.txt`;
    this.timer = null;
  }

  clearArchive = () => {
    try {
      execSync(`rm -rf ${this.archivePath}`);
      fs.mkdirSync(this.archivePath);
    } catch (error) {
      console.log(error);
    }
  };

  createAndFillStorage = (currentPath, destinationPath) => {
    if (!fs.existsSync(this.storagePath)) fs.mkdirSync(this.storagePath);

    mv(currentPath, destinationPath, (err) => {
      if (err) {
        console.log(err);
      } else {
        //   console.log("Successfully moved the file!");
      }
    });
  };

  clearSpace = () => {
    fs.readdir(`${this.storagePath}`, (err, files) => {
      if (err) return console.log("Unable to scan directory: " + err);

      const numberOfFilesToRemove = Math.ceil(files.length / 5);

      files.forEach((file, index) => {
        if (index + 1 > numberOfFilesToRemove) return;
        fs.unlinkSync(path.join(this.storagePath, `/${file}`));
      });
    });
  };

  deleteInstructionFile = () => {
    fs.unlinkSync(path.join(__dirname, `/${this.instruction}`));
  };

  concatSlices = () => {
    const stamp = moment().format("YYYY-MM-DD HH:mm:ss");
    const currentTimestamp = `${stamp.split(" ").join("_")}.mp4`;
    const currentPath = path.join(__dirname, currentTimestamp);
    const destinationPath = path.join(
      __dirname,
      `storage/${this.name}`,
      currentTimestamp
    );

    const ffmpegArgs =
      `-f concat -i ${this.instruction} -c copy ${currentTimestamp}`.split(" ");
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
          this.createAndFillStorage(currentPath, destinationPath);
          this.clearArchive();
          this.deleteInstructionFile();
        }
      });
    } catch (error) {
      console.log(error);
      this.deleteInstructionFile();
    }
  };

  mergeSlices = (dirName, instruction) => {
    const txtFileContent = [];

    fs.readdir(this.archivePath, (err, files) => {
      if (err) return console.log("Unable to scan directory: " + err);

      files.forEach((file) => {
        const extCheck = /.ts$/gi;
        if (!extCheck.test(file)) return;

        const slicePath = `file temp_archive/${dirName}/${file}`;
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
      this.concatSlices();
    });
  };

  startRecording = () => {
    try {
      console.log("\n");
      console.log("starting recording process...");

      this.timer = setInterval(() => {
        this.mergeSlices(this.name, this.instruction);
      }, variables.CONCAT_INTERVAL);

      const ffmpegArgs =
        `-stimeout 5000000 -loglevel error -rtsp_transport tcp -i ${this.link} -threads 1 -shortest -fflags shortest -c:v libx264 -profile:v main -crf 26 -preset veryfast -strict -2 -hls_time ${variables.SLICE_DURATION} -hls_start_number_source datetime -loglevel error -hls_flags append_list+program_date_time -master_pl_name output.m3u8 -strftime 1 -use_localtime 1 -hls_segment_filename ${this.archivePath}/slice_%Y-%m-%d_%H-%M-%S.ts ${this.archivePath}/stream.m3u8`.split(
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
        clearInterval(this.timer);
        kill(child.pid);
      });
    } catch (error) {
      console.log(error);
      clearInterval(this.timer);
      kill(child.pid);
    }
  };

  init = () => {
    if (!fs.existsSync(this.archivePath)) fs.mkdirSync(this.archivePath);
    if (!fs.existsSync(this.storagePath)) fs.mkdirSync(this.storagePath);

    console.log("establishing connection with RTSP stream...");
    console.log(`camera name: ${this.name}`);
    console.log("\n");
    let isRecordingTriggered = false;

    const ffprobeArgs =
      `-stimeout 20 -v quiet -print_format json -show_format -show_streams ${this.link}`.split(
        " "
      );
    try {
      const child = spawn("ffprobe", ffprobeArgs);

      child.stdout.on("data", (data) => {
        process.stdout.write(data.toString());
        if (isRecordingTriggered) return;
        this.startRecording();
        isRecordingTriggered = true;
      });

      child.stderr.on("data", (data) => {
        process.stdout.write(data.toString());
        this.init();
      });

      child.on("close", (code) => {
        if (code === 0) {
          console.log("connection is successful");
          return;
        }

        console.log("connecting process finished with code " + code);
        kill(child.pid);
      });
    } catch (error) {
      kill(child.pid);
    }
  };
}

module.exports = ArchiveService;
