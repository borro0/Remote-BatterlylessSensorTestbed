void setup() {
  // put your setup code here, to run once:
  analogWriteResolution(12);
  digitalWrite(32, LOW);
  pinMode(13, OUTPUT);
  pinMode(32, OUTPUT);

  digitalWrite(13, HIGH);   // turn the LED on (HIGH is the voltage level)

  delay(100); // delay to ensure serial port can connect before first output

  Serial.println("Hello!");
}

// value stands for 0-4095 adc value
void setOutput(int value)
{
  Serial.print("Set output to: ");
  Serial.println(value);

  analogWrite(A21, value);
  analogWrite(A22, value);

  if (value)
  {
    digitalWrite(13, HIGH);
  }
  else 
  {
    digitalWrite(13, LOW); 
  }
}

void loop()
{
  // ON time
  setOutput(4095);
  delay(1000);

  // OFF time
  setOutput(0);
  delay(1000);
}
