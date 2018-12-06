const { spawn } = require("child_process");

var pyProcess = spawn("python", ["print_continuously.py"]);

pyProcess.stdout.setEncoding("utf8");
pyProcess.stdout.on("data", data => {
  console.log(data);
});

pyProcess.stdout.on("end", token => {
  console.log("Token " + token + ": closing connection.");
});