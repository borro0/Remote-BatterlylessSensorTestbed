import subprocess
import sys

print ('Number of arguments:', len(sys.argv), 'arguments.')
print ('Argument List:', str(sys.argv))

binary = sys.argv[1];
# binary = './uploads/file-1545058078741.txt';

subprocess.run(["MSP430Flasher.exe", "-w", binary])
# run_command(command)
print("i'm done :D")