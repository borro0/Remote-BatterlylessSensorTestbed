#include <stdio.h>
#include "pb_encode.h"
#include "pb_decode.h"
#include "simple.pb.h"
#include <PacketSerial.h>

PacketSerial myPacketSerial; // used for packets sending/receiving
IntervalTimer myTimer; // used as source for PWM
const int pwmPin = 13;  // pin assigned to PWM

// On and off time for PWM signal, defined is us
volatile int pwm_on_time = 500000;
volatile int pwm_off_time = 500000;

void setup()
{
    pinMode(13, OUTPUT);
    digitalWrite(13, HIGH);

    myPacketSerial.begin(115200);
    myPacketSerial.setPacketHandler(&onPacketReceived);
    myTimer.begin(handlePWM, pwm_on_time);

    digitalWrite(13, LOW);
}

void loop() 
{
  // Handle serial packets
  myPacketSerial.update();
}

// This function is called when a new packet has been received
void onPacketReceived(const uint8_t* buffer, size_t size)
{
  uint8_t tempBuffer[size];

  // Copy the packet into our temporary buffer.
  memcpy(tempBuffer, buffer, size);

  // Allocate space for the decoded message
  SimpleMessage message = SimpleMessage_init_zero;
  
  /* Create a stream that reads from the buffer. */
  pb_istream_t istream = pb_istream_from_buffer(tempBuffer, size);
  
  /* Now we are ready to decode the message. */
  pb_decode(&istream, SimpleMessage_fields, &message);

  // update pwm
  updatePWM(message.on_time, message.off_time);

  /* Create a stream that will write to our buffer. */
  pb_ostream_t ostream = pb_ostream_from_buffer(tempBuffer, size);
         
  /* Now we are ready to encode the message! */
  pb_encode(&ostream, SimpleMessage_fields, &message);

  // send packet
  myPacketSerial.send(tempBuffer, size);  
}

void updatePWM(int message_on_time, int message_off_time)
{
  myTimer.end(); // stop current timer
  if (message_off_time == 0)
  {
    // This means we should power continiously, therefor the timer is not required anymore
  }
  pwm_on_time = message_on_time;
  pwm_off_time = message_off_time;
}

void handlePWM() {
  static int pinState = LOW;
  
  if (pinState == LOW) {
    pinState = HIGH;
    myTimer.update(pwm_off_time); // this is off time
  } else {
    myTimer.update(pwm_on_time); // this is on time
    pinState = LOW;
  }
  
  digitalWrite(pwmPin, pinState);
}
