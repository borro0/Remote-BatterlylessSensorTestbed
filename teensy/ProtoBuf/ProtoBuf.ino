#include <stdio.h>
#include "pb_encode.h"
#include "pb_decode.h"
#include "simple.pb.h"
#include <PacketSerial.h>

PacketSerial myPacketSerial;

void setup()
{
    pinMode(13, OUTPUT);
    digitalWrite(13, HIGH);

    myPacketSerial.begin(115200);
    myPacketSerial.setPacketHandler(&onPacketReceived);
    
    delay(1000);

    digitalWrite(13, LOW);
    
    
}

void loop() {
  // put your main code here, to run repeatedly:
  myPacketSerial.update();
}

void onPacketReceived(const uint8_t* buffer, size_t size)
{
  uint8_t tempBuffer[size];

  // Copy the packet into our temporary buffer.
  memcpy(tempBuffer, buffer, size);

  /* Allocate space for the decoded message. */
  SimpleMessage message = SimpleMessage_init_zero;
  
  /* Create a stream that reads from the buffer. */
  pb_istream_t istream = pb_istream_from_buffer(tempBuffer, size);
  
  /* Now we are ready to decode the message. */
  pb_decode(&istream, SimpleMessage_fields, &message);

  message.frequency += 1;
  message.duty_cycle += 1;

  /* Create a stream that will write to our buffer. */
  pb_ostream_t ostream = pb_ostream_from_buffer(tempBuffer, size);
         
  /* Now we are ready to encode the message! */
  pb_encode(&ostream, SimpleMessage_fields, &message);

  // send packet
  myPacketSerial.send(tempBuffer, size);  
}
