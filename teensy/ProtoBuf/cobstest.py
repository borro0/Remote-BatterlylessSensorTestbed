from cobs import cobs
import serial
import binascii
import simple_pb2

def parse_input(input):
    

    simple_received = simple_pb2.SimpleMessage()    
    simple_received.ParseFromString(input)
    print(simple_received.lucky_number2)


simple = simple_pb2.SimpleMessage()

simple.lucky_number = 1;
simple.lucky_number2 = 3;

byte_string = simple.SerializeToString()

# byte_string = bytearray(b'Hello world This is a test\n')
# byte_string =  bytearray(b'\n\x91\x8c')

print(binascii.hexlify(byte_string))

encoded = cobs.encode(byte_string)
print(binascii.hexlify(encoded))
encoded += b'\x00' # add delimiter
print(binascii.hexlify(encoded))
# decoded = cobs.decode(encoded)
# print(decoded)

with serial.Serial('COM3', 115200, timeout=1) as ser: 
    print(ser.name)
    ser.write(encoded)
    input = ser.read(100) # read 3 bytes
    if len(input) is not 0: # only handle non zero input
        print(binascii.hexlify(input))
        input = input[:-1]
        input = cobs.decode(input)
        print(binascii.hexlify(input))
        parse_input(input)


