// Create an IntervalTimer object 
IntervalTimer myTimer;

const int ledPin = 5;  // the pin with a LED

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  myTimer.begin(blinkLED, 100000);  // blinkLED to run every 0.15 seconds
}

// The interrupt will blink the LED, and keep
// track of how many times it has blinked.
int ledState = LOW;
volatile unsigned long blinkCount = 0; // use volatile for shared variables

// functions called by IntervalTimer should be short, run as quickly as
// possible, and should avoid calling other functions if possible.
void blinkLED() {
  if (ledState == LOW) {
    ledState = HIGH;
    myTimer.update(9900); // this is off time
    blinkCount = blinkCount + 1;  // increase when LED turns on
  } else {
    myTimer.update(100); // this is on time
    ledState = LOW;
  }
  digitalWrite(ledPin, ledState);
  
}

// The main program will print the blink count
// to the Arduino Serial Monitor
void loop() {
  if ( Serial.available()) {
    char ch = Serial.read();
    Serial.print("Received a char: ");
    Serial.println(ch);
  }
}
