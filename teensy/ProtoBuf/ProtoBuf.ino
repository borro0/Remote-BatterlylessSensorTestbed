#include <stdio.h>
#include "pb_encode.h"
#include "pb_decode.h"
#include "simple.pb.h"
#include <PacketSerial.h>

PacketSerial myPacketSerial;

void setup()
{
    /* This is the buffer where we will store our message. */
    uint8_t buffer[128];
    size_t message_length;
    bool status;

    pinMode(13, OUTPUT);
    digitalWrite(13, HIGH);

    myPacketSerial.begin(115200);
    myPacketSerial.setPacketHandler(&onPacketReceived);
    
    delay(1000);

    digitalWrite(13, LOW);
    
    /* Encode our message */
    {
        /* Allocate space on the stack to store the message data.
         *
         * Nanopb generates simple struct definitions for all the messages.
         * - check out the contents of simple.pb.h!
         * It is a good idea to always initialize your structures
         * so that you do not have garbage data from RAM in there.
         */
        SimpleMessage message = SimpleMessage_init_zero;
        
        /* Create a stream that will write to our buffer. */
        pb_ostream_t stream = pb_ostream_from_buffer(buffer, sizeof(buffer));
        
        /* Fill in the lucky number */
        message.lucky_number = 13;
        message.lucky_number2 = 14;
        
        /* Now we are ready to encode the message! */
        status = pb_encode(&stream, SimpleMessage_fields, &message);
        message_length = stream.bytes_written;
        
        /* Then just check for any errors.. */
        if (!status)
        {
//            Serial.print("Encoding failed: ");
//            Serial.println(PB_GET_ERROR(&stream));
            return;
        }
    }
}

void loop() {
  // put your main code here, to run repeatedly:
  myPacketSerial.update();
}

void onPacketReceived(const uint8_t* buffer, size_t size)
{
  bool status;
  uint8_t tempBuffer[size];
  size_t message_length;

  // Copy the packet into our temporary buffer.
  memcpy(tempBuffer, buffer, size);
  {
        /* Allocate space for the decoded message. */
        SimpleMessage message = SimpleMessage_init_zero;
        
        /* Create a stream that reads from the buffer. */
        pb_istream_t istream = pb_istream_from_buffer(tempBuffer, size);
        
        /* Now we are ready to decode the message. */
        status = pb_decode(&istream, SimpleMessage_fields, &message);

        message.lucky_number2 += 1;
 
        /* Create a stream that will write to our buffer. */
        pb_ostream_t ostream = pb_ostream_from_buffer(tempBuffer, size);
               
        /* Now we are ready to encode the message! */
        status = pb_encode(&ostream, SimpleMessage_fields, &message);
        message_length = ostream.bytes_written;
    }

  myPacketSerial.send(tempBuffer, size);
}
