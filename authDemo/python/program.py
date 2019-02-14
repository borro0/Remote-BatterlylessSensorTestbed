import subprocess
import sys
import platform
import threading

binary = sys.argv[1]; # binary firmware
time = sys.argv[2]; # time (in seconds)

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
		#sigrok-cli --driver fx2lafw --time 3s -O vcd -o vcd-samplel

# First we flash the MCU with the new firmware, ensure MCU is powered and debugger is connected
# Note that the flasher should be available in your path for it to work
if platform == "Windows":
	subprocess.run(["MSP430Flasher.exe", "-w", binary])
else:
	subprocess.run(["MSP430Flasher", "-w", binary])

# We now start the logic analyser
thread_logic_analyzer = LogicAnalyzerThread(time)
thread_logic_analyzer.start()
#Also record the uart output

# Wait for all threads to finish
thread_logic_analyzer.join()

#We are done with our measurements, store results in file or database

print("i'm done :D")