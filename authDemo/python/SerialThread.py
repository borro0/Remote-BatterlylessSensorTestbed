import threading
import serial

class SerialThread (threading.Thread):
	def __init__(self, stop, platform):
		threading.Thread.__init__(self)
		self.stop = stop
		self.platform = platform
	def run(self):
		if self.platform == "Windows":
			print("Serial input is currently not supported for windows");
		else:
			print("Starting serial input reading")
			with serial.Serial('/dev/ttyACM1', 9600, timeout=1) as ser:
				while not self.stop(): # this checks if we should stop or not
					line = ser.readline()   # read a '\n' terminated line
					print(line)