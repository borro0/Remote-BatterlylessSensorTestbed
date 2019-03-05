import threading
import serial
import time
import os

class SerialThread (threading.Thread):
	def __init__(self, stop, platform, hardware, time, testrun_id, output_path):
		threading.Thread.__init__(self)
		self.stop = stop
		self.platform = platform
		self.hardware = hardware
		self.time = time
		self.testrun_id = testrun_id
		self.output_path = output_path

	def run(self):
		buff = f"Running test {self.testrun_id} for {self.time} seconds"
		if not self.hardware:
			self.write_file(buff)
		else:
			if self.platform == "Windows":
				print("Serial input is currently not supported for windows");
			else:
				print("Starting serial input reading")
				# open serial port, gets closed automatically when out of the 'with' scope
				with serial.Serial('/dev/ttyACM1', 9600, timeout=1) as ser: 
					while not self.stop(): # this checks if we should stop or not
						line = ser.readline() # read a '\n' terminated line
						if len(line) is not 0: # only print if something was recorded
							line = line.decode("utf-8") # decode bytes into string
							print(line)
							buff += line
					self.write_file(buff)
	
	def write_file(self, buff):
		with open(f"{self.output_path}", "w") as f:
			print(f"Writing serial output to {self.output_path}")
			f.write(buff)

	