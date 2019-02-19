import subprocess
import sys
import platform
import threading
from SerialThread import SerialThread

if len(sys.argv) > 1:
	binary = sys.argv[1]; # binary firmware
	time = sys.argv[2]; # time (in seconds)
else:
	binary = "/home/borro0/Remote-BatterlylessSensorTestbed/OutOfBox_MSP430FR5969/Debug/OutOfBox_MSP430FR5969.txt"
	time = 2

	print(f"No arguments are given, reset to the default arguments:\n binary = {binary}\n time = {time}")

platform = platform.system(); # detect on what operating system we are running

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

# First we flash the MCU with the new firmware, ensure MCU is powered and debugger is connected
# Note that the flasher should be available in your path for it to work

flasher = ''
if platform == "Windows":
	flasher = "MSP430Flasher.exe"
else:
	flasher = "MSP430Flasher"

subprocess.run([flasher, "-w", binary, "-z", "[RESET]"]) # Flash and reset MCU

stop_threads = False

# We now start the logic analyser
thread_logic_analyzer = LogicAnalyzerThread(time)
thread_logic_analyzer.start()
#Also record the uart output
thread_serial = SerialThread(lambda: stop_threads, platform)
thread_serial.start()

# Wait for all threads to finish
thread_logic_analyzer.join()
stop_threads = True

#We are done with our measurements, store results in file or database
print("i'm done :D")