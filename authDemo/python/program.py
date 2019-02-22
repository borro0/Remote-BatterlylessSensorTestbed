import subprocess
import sys
import platform
import threading
from SerialThread import SerialThread
from LogicAnalyzerThread import LogicAnalyzerThread
from pymongo import MongoClient
from bson.objectid import ObjectId

# If hardware is disabled, we bypass all logic related to hardware (serial input, logic analayser, flasher)
hardware = False 

if len(sys.argv) > 1:
	binary = sys.argv[1]; # binary firmware
	time = sys.argv[2]; # time (in seconds)
	test_run_id = sys.argv[3]; # _id of testrun, used for updating database
else:
	binary = "/home/borro0/Remote-BatterlylessSensorTestbed/OutOfBox_MSP430FR5969/Debug/OutOfBox_MSP430FR5969.txt"
	time = 2

	print(f"No arguments are given, reset to the default arguments:\n binary = {binary}\n time = {time}")

platform = platform.system(); # detect on what operating system we are running


if hardware:

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

else:
	# Do something to compensate for hardware
	pass

# Connect to database to update test results
client = MongoClient()
db = client.auth_demo
collection = db.users

# Unstringify the test_run_id
test_run_id = test_run_id.replace('"', '')
print(test_run_id)

# Query to set status to done
myquery = {"testRuns._id" : ObjectId(test_run_id)}
newvalues = { "$set": { "testRuns.$.status": "done" } }	
collection.update_one(myquery, newvalues)


#We are done with our measurements, store results in file or database
print("i'm done :D")