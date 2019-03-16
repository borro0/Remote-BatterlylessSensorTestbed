import threading
import serial
import time
import os

class TeensySerial (threading.Thread):
    def __init__(self):
        pass

    def run(self):
        print("Hello i'm TeensySerial")