const {spawn: spawn} = require("node-pty");

function start_python(sseConnection, path) {
	let pyProcess = spawn("python.exe", ["./python/program.py", path]);

	console.log("Starting python");

	pyProcess.on('data', function(data) {
	  	console.log(data);
	  	sseConnection.send(data);
	});

	pyProcess.on("exit", function(exitCode) {
		let exit_string = "Exiting with code " + exitCode;
	  	console.log(exit_string);
	});
}

exports.start_python = start_python;