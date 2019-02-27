import subprocess
import sys, os
import platform
import threading
from SerialThread import SerialThread
from LogicAnalyzerThread import LogicAnalyzerThread
from pymongo import MongoClient
from bson.objectid import ObjectId
import argparse
import shutil

# If hardware is disabled, we bypass all logic related to hardware (serial input, logic analayser, flasher)
hardware = False 

parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--binary', default="/home/borro0/Remote-BatterlylessSensorTestbed/OutOfBox_MSP430FR5969/Debug/OutOfBox_MSP430FR5969.txt",
                    help='binary used for flashing the device')
parser.add_argument('--time', type=int, default=3, help='amount of time test should run in seconds')
parser.add_argument('--id', default="5c713d5c8691cb303cdbd56c", help='id of testrun')

args = parser.parse_args()

binary = args.binary
time = args.time
testrun_id = args.id

# Setup paths to store output files
tmp_folder = "tmp"
output_folder = f"{tmp_folder}/{testrun_id}"
serial_output_path = f"{output_folder}/serial_output.txt"
trace_output_path = f"{output_folder}/trace.sr"

print(f"Testrun id: {testrun_id}")
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

# Create output directory for 
try:
    os.makedirs(output_folder)
except FileExistsError:
    # directory already exists, should not occur
    pass

# Variable used by serial thread to signal exit
stop_threads = False

# We now start the logic analyser
thread_logic_analyzer = LogicAnalyzerThread(time, hardware, platform, trace_output_path)
thread_logic_analyzer.start()
# Also record the uart output
thread_serial = SerialThread(lambda: stop_threads, platform, hardware, time, testrun_id, serial_output_path)
thread_serial.start()

# Wait for all threads to finish
thread_logic_analyzer.join()
stop_threads = True # trigger serial thread to stop
thread_serial.join()

# Connect to database to update test results
client = MongoClient()
db = client.auth_demo
collection = db.users

# Unstringify the testrun_id
testrun_id = testrun_id.replace('"', '')

# Query to set status to done
with open(serial_output_path) as f:
	myquery = {"testRuns._id" : ObjectId(testrun_id)}
	file = f.read()
	newvalues = { "$set": 
		{ 	
			"testRuns.$.status": "done", 
			"testRuns.$.serial.data": file,
			"testRuns.$.serial.filename": "serial",
			"testRuns.$.serial.filetype": "txt"
		}
	}	
	collection.update_one(myquery, newvalues)

# We are done updating, we can remove the temporary files
shutil.rmtree(output_folder)

#We are done with our measurements, store results in file or database
print("i'm done :D")