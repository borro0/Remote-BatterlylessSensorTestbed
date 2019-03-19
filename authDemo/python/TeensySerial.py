import threading
import serial
import time
import os
from queue import Queue
from simple_pb2 import SimpleMessage # contains message definition
import platform
from cobs import cobs
import binascii

class TeensySerial (threading.Thread):
    def __init__(self, stop, receive_callback):
        threading.Thread.__init__(self)
        if platform.system() is "Windows":
            self.serial_port = 'COM3'
        else:
            self.serial_port = '/dev/ttyACM1'
        
        self.stop = stop
        self.send_queue = Queue(maxsize=0)
        self.receive_callback = receive_callback

    def run(self):
        print("Hello i'm TeensySerial")

        # Open serial port
        with serial.Serial(self.serial_port, 115200, timeout=1) as ser: 
            while not self.stop(): # this checks if we should stop or not
                # First check whether we have something to send
                if self.send_queue.empty() is False:
                    try:
                        message_to_send = self.send_queue.get_nowait() # Fetch item form queue
                    except Empty as ex:
                        print(f"Somehow the queue is not empty but still can't fetch an item: {ex}")
                    else:
                        ser.write(message_to_send) # Write this message to serial port
                    self.send_queue.task_done() # Signal we handled this queue item

                # Now read our input, parse message if available
                input = ser.read(100) # Read the serial port
                if len(input) is not 0: # Check if read is non-zero 
                    self.parse_input(input) # Parse the input message

    # Takes a message, converts it to a serialized COBS packet, put's it in send queue
    def put_message(self, message):
        byte_string = message.SerializeToString() # Serialize message object
        packet = cobs.encode(byte_string) # COBS encode packet
        packet += b'\x00' # Add packet delimiter
        self.send_queue.put(packet) # Put packet in queue

    def parse_input(self, input):
        input = input[:-1] # Remove last byte (which is delimiter)
        packet = cobs.decode(input) # COBS decode packet
        message = SimpleMessage() # Create mesage object
        message.ParseFromString(packet) # Parse message object
        if self.receive_callback:
            self.receive_callback(message)
        
if __name__ == '__main__':

    def calculate_on_off_time(frequency, duty_cycle):
        period_us = (1 / frequency) * 1000000
        on_time = period_us * (duty_cycle / 100)
        off_time = period_us * ((100 - duty_cycle) / 100)

        return int(on_time), int(off_time)

    def receive_callback(message):
        print(f"Message received: on_time = {message.on_time}, off_time = {message.off_time}")

    stop = False
    thread = TeensySerial(lambda: stop, receive_callback)
    thread.start()

    while True:
        message = SimpleMessage() # Create message object

        print("Hello, please enter desired frequency")
        frequency = float(input('--> '))

        print("please enter desired duty cycle")
        duty_cycle = float(input('--> '))

        message.on_time, message.off_time = calculate_on_off_time(frequency, duty_cycle)
        print(f"On time = {message.on_time}, off time = {message.off_time}")
        
        thread.put_message(message)
        print("Message put in queue!")

        print("Enter q to quit, or other to continue")
        if input() is 'q':
            break      

    stop = True # Force thread to finish
    thread.join()
    print("Done")