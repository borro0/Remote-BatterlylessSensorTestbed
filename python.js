const { spawn } = require("node-pty");

function start_python(callback) {
	var pyProcess = spawn("python.exe", ["print_continuously.py"]);

	console.log("Starting python");

	pyProcess.on('data', function(data) {
	  	console.log(data);
	  	callback(data);
	});

	pyProcess.on("exit", exitCode => {
		var exit_string = "Exiting with code " + exitCode
	  	console.log(exit_string);
	  	callback(exit_string);
	});
}

exports.start_python = start_python;