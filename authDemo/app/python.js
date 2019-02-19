const {spawn: spawn} = require("node-pty");
const os = require("os");

function start_python(sseConnection, path) {

	let platform = os.platform();
	let python_path;
	let time = 3;

	console.log(platform)

	if (platform == 'win32')
	{
		python_path = "python.exe";
	}
	else
	{
		python_path = "python";
	}

	let pyProcess = spawn(python_path, ["./python/program.py", path, "3"]);

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