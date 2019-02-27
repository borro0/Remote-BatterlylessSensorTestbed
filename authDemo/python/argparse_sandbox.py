import argparse

parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--binary', default="/home/borro0/Remote-BatterlylessSensorTestbed/OutOfBox_MSP430FR5969/Debug/OutOfBox_MSP430FR5969.txt",
                    help='binary used for flashing the device')
parser.add_argument('--time', type=int, default=3, help='amount of time test should run in seconds')
parser.add_argument('--id', default="5c713d5c8691cb303cdbd56c", help='id of testrun')

args = parser.parse_args()
print(args.binary)
print(args.time)
print(args.id)