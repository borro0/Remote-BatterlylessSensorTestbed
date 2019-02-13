import subprocess
import sys
import platform

binary = sys.argv[1];

#First we flash the MCU with the new firmware

#Note that the flasher should be available in your path for it to work
if platform.system() == "Windows":
	subprocess.run(["MSP430Flasher.exe", "-w", binary])
else:
	subprocess.run(["MSP430Flasher", "-w", binary])

#We now start the logic analyser
#Also record the uart output

#We are done with our measurements, store results in file or database

print("i'm done :D")