const {spawn: spawn} = require("node-pty");
const os = require("os");

function start_python(sseConnection, path) {

	let platform = os.platform();

	console.log(platform)

	let pyProcess;
	if (platform == 'win32')
	{
		pyProcess = spawn(python_path, ["./python/program.py", path]);
	}
	else
	{
		pyProcess = spawn('python', ["./python/program.py", path]);
	}

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