from cobs import cobs
import serial
import binascii
import simple_pb2
import threading
from TeensySerial import TeensySerial

def parse_input(input):
    # Create mesage object
    simple_received = simple_pb2.SimpleMessage()    

    # Parse message object
    simple_received.ParseFromString(input)

    # Print fields
    print(f"Frequency = {simple_received.frequency}, duty_cycle = {simple_received.duty_cycle}")

# Create message object
simple = simple_pb2.SimpleMessage()

# Set message object fields
simple.frequency = 10;
simple.duty_cycle = 50;

# Serialize message object
byte_string = simple.SerializeToString()

# COBS encode packet
encoded = cobs.encode(byte_string)

# Add packet delimiter
encoded += b'\x00'

# Open serial port
with serial.Serial('COM3', 115200, timeout=1) as ser: 
    # Print serial port name
    print(f"Opened {ser.name}")

    # Write our packet
    ser.write(encoded)

    # Read the console
    input = ser.read(100)

    # Check if read is non-zero    
    if len(input) is not 0:

        # Remove last byte (which is delimiter)
        input = input[:-1]

        # COBS decode packet
        input = cobs.decode(input)

        # Parse the input message
        parse_input(input)


