import subprocess
import sys
import platform

print ('Number of arguments:', len(sys.argv), 'arguments.')
print ('Argument List:', str(sys.argv))

binary = sys.argv[1];

if platform.system() == "Windows":
	subprocess.run(["MSP430Flasher.exe", "-w", binary])
else:
	#note that this assumes that the current folder is the nodejs server.js root folder
	subprocess.run(["MSP430Flasher", "-w", binary])
print("i'm done :D")