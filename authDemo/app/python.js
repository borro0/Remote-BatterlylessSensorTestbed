const {spawn: spawn} = require("node-pty");
const os = require("os");
var User = require('./models/user');

function start_python(sseConnection, path, id, email) {

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

	console.log("Starting python");
	let pyProcess = spawn(python_path, ["./python/program.py", "--binary", path, "--time", `${time}`, "--id", `${id}`]);

	pyProcess.on('data', function(data) {
	  	console.log(data);
	  	sseConnection.send(data);
	});

	pyProcess.on("exit", function(exitCode) {
		let exit_string = "Exiting with code " + exitCode;
	  	console.log(exit_string);
	  	console.log(email);

	  	// retreive user to update table
	  	User.findOne({ 'email' :  email }, function(err, user) {
	  		if (user)
	  		{
	  			sseConnection.send(user.stripBinary());
	  		}
	  	});
	});
}

exports.start_python = start_python;