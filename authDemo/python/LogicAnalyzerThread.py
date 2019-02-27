import threading

class LogicAnalyzerThread (threading.Thread):
	def __init__(self, time, hardware, platform, output_path):
		threading.Thread.__init__(self)
		self.time = time
		self.hardware = hardware
		self.platform = platform
		self.output_path = output_path
	def run(self):
		if self.platform == "Windows":
			print("Logic analyzer is currently not supported for windows");
		else:
			print(f"Running logic analyzer for {self.time} seconds.")
			driver = "fx2lafw"
			if not self.hardware:
				driver = "demo";
			# running logic analyzer with demo driver currently
			subprocess.run(["sigrok-cli", "--driver", driver, "--time", f"{self.time}s", "-o", f"{self.output_path}"])