import threading

class LogicAnalyzerThread (threading.Thread):
	def __init__(self, time):
		threading.Thread.__init__(self)
		self.time = time
	def run(self):
		if platform == "Windows":
			printf("Logic analyzer is currently not supported for windows");
		else:
			print(f"Running logic analyzer for {self.time} seconds.")
			# running logic analyzer with demo driver currently
			subprocess.run(["sigrok-cli", "--driver", "fx2lafw", "--time", f"{time}s", "-o", "sample.sr"])