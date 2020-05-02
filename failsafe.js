/*Failsafe System Version 1.1.6
(CC-BY-NC-ND-4.0) AstroGD - www.astrogd.de
Edited by Cherob - www.cherob.eu */

//Required Modules and Files
const cp = require("child_process");
const package = require(`${__dirname}/package.json`);

let title = "   ______      _  _   _____ \n"
  + "   |  ____|    (_)| | / ____| \n"
  + "   | |__  __ _  _ | || (___    __ _ __   __ ___ \n"
  + "   |  __|/ _` || || | \\___ \\  / _` |\\ \\ / // _ \\ \n"
  + "   | |  | (_| || || | ____) || (_| | \\ V /|  __/ \n"
  + "   |_|   \\__,_||_||_||_____/  \\__,_|  \\_/  \\___|"
var filedirectory = "/main.js";
var version = "1.1.5";

let unixtime = ('[' + Math.round((new Date()).getTime() / 1000) + ']');

function start() {
  console.log(`\n ${title}  - V${version} -\n`);
  let programm = cp.fork(`${__dirname}${filedirectory}`);
  programm.on('exit', (code, signal) => {
    switch (code) {
      case 28:
        console.log(`\nAn unknown Error occurred. Shutting down.`
          + `\nThe Programm is being closed in 3 Seconds`);
        setTimeout(function () { process.exit(); }, 3000);
        break;
      case 29:
        console.log(`\nSystem thread encountered an error.`
          + `\nThe Programm is being restarted in 5 Seconds`);
        setTimeout(function () { start(); }, 5000);
        break;
      default:
        console.log(`\nSystem thread crashed unexpectedly`
          + `\nCode: ${code}`
          + `\nSignal: ${signal}`
          + `\nThe Programm is being restarted in 10 Seconds`);
        setTimeout(function () { start(); }, 10000);
        break;
    }
  });
  console.log(unixtime, `Starting "${package.name}.js"`);
  console.log(unixtime, "OUTPUT PROGRAMM");
}

//startup after loading
start();
