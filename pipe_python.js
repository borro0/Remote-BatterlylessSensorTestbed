const http = require('http');
const { spawn } = require("node-pty");
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');

  // URL gets requested twice, ignore when ico is fetched
  if (req.url != '/favicon.ico') {
      start_python();
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function start_python() {
	var pyProcess = spawn("python.exe", ["print_continuously.py"]);

	console.log("Starting python");

	pyProcess.on("data", data => {
	  console.log(data);
	});

	pyProcess.on("exit", exitCode => {
	  console.log("Exiting with code " + exitCode);
	});
}