const moment = require("moment");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    crimson: "\x1b[38m", // Scarlet
  },
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    crimson: "\x1b[48m",
  },
};

const logs = {
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARNING: "WARNING",
  ERROR: "ERROR",
  TIMESTAMP: "TIMESTAMP",
  DIVIDER: "DIVIDER",
  LOADING: "LOADING",
};

class Logger {
  loaderId = null;

  addLoader = () => {
    // const arr = ["   /  ", "   |  ", "   \\  ", "   -  "];
    const arr = ["   >    ", "   >>   ", "   >>>  ", "   >>>> ", "   >>>>>"];
    let index = 0;
    this.loaderId = setInterval(() => {
      process.stdout.write(`\r${arr[index]}`);

      if (index + 1 === arr.length) {
        index = 0;
        return;
      }

      index += 1;
    }, 500);
  };

  removeLoader = () => clearInterval(this.loaderId);

  addLog = (logOption, info) => {
    switch (logOption) {
      case logs.INFO:
        console.log(colors.fg.blue, colors.bright, ` ${info}  `);
        break;

      case logs.SUCCESS:
        console.log(colors.fg.green, colors.bright, ` ${info}  `);
        break;

      case logs.WARNING:
        console.log(colors.fg.yellow, colors.bright, ` ${info}  `);
        break;

      case logs.ERROR:
        console.log(colors.fg.red, colors.bright, ` ${info}  `);
        break;

      case logs.TIMESTAMP:
        console.log(colors.reset, "");

        console.log(
          colors.fg.yellow,
          colors.bright,
          colors.underscore,
          `>>> ${moment().format("YYYY-MM-DD HH:mm:ss")} <<< `
        );

        console.log(colors.reset, "");
        break;

      //   case logs.DIVIDER:
      //     console.log(
      //       colors.reset,
      //       colors.fg.crimson,
      //       colors.bright,
      //       "===============================================  "
      //     );
      //     break;

      default:
        break;
    }
  };
}

const logger = new Logger();

module.exports = {
  logger,
  logs,
};
