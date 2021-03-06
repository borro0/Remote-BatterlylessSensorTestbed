import subprocess
import sys, os
import platform
import threading
from SerialThread import SerialThread
from LogicAnalyzerThread import LogicAnalyzerThread
from TeensySerial import TeensySerial
from pymongo import MongoClient
from bson.objectid import ObjectId
import argparse
import shutil

# If hardware is disabled, we bypass all logic related to hardware (serial input, logic analayser, flasher)
hardware = False 

parser = argparse.ArgumentParser(description='This script manages test runs.')
parser.add_argument('--binary', default="/home/borro0/Remote-BatterlylessSensorTestbed/OutOfBox_MSP430FR5969/Debug/OutOfBox_MSP430FR5969.txt",
                    help='binary used for flashing the device')
parser.add_argument('--time', type=int, default=3, help='amount of time test should run in seconds')
parser.add_argument('--id', default="5c713d5c8691cb303cdbd56c", help='id of testrun')
parser.add_argument("--hardware", action="store_true", help="pass this option to ensure the testbed will use real hardware isntead of emulation")

# Storing command line arguments
args = parser.parse_args()
binary = args.binary
time = args.time
testrun_id = args.id
hardware = args.hardware

# Setup paths to store output files
tmp_folder = "tmp"
output_folder = f"{tmp_folder}/{testrun_id}"
serial_output_path = f"{output_folder}/serial_output.txt"
trace_output_path = f"{output_folder}/trace.sr"

print(f"Testrun id: {testrun_id}")
dir_path = os.path.dirname(os.path.realpath(__file__))
print(binary)
print(dir_path)
platform = platform.system() # detect on what operating system we are running

if hardware:
	# First we flash the MCU with the new firmware, ensure MCU is powered and debugger is connected
	# Note that the flasher should be available in your path for it to work
	flasher = ''
	if platform == "Windows":
		flasher = "MSP430Flasher.exe"
	else:
		flasher = "MSP430Flasher"

	print(binary)
	subprocess.run([flasher, "-w", binary, "-z", "[VCC,RESET]"]) # Flash and reset MCU

# Create output directory for 
try:
    os.makedirs(output_folder)
except FileExistsError:
    # directory already exists, should not occur
    pass

# Variable used by threads to signal exit
stop_threads = False

# Start serial thread with teensy to handle power source
thread_teensy_serial = TeensySerial(lambda: stop_threads, None)
thread_teensy_serial.start()

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
with open(serial_output_path) as serial_file, open(trace_output_path, "rb") as trace_file:
	myquery = {"testRuns._id" : ObjectId(testrun_id)}
	serial_file_read = serial_file.read()
	trace_file_read = trace_file.read()
	newvalues = { "$set": 
		{ 	
			"testRuns.$.status": "done", 
			"testRuns.$.serial.data": serial_file_read,
			"testRuns.$.serial.filename": "serial",
			"testRuns.$.serial.filetype": "txt",
			"testRuns.$.trace.data": trace_file_read,
			"testRuns.$.trace.filename": "trace",
			"testRuns.$.trace.filetype": "sr"
		}
	}	
	collection.update_one(myquery, newvalues)

# We are done updating, we can remove the temporary files
shutil.rmtree(output_folder)

#We are done with our measurements, store results in file or database
print("i'm done :D")