#include <SD.h>
#include <SPI.h>

File myFile;

const int chipSelect = BUILTIN_SDCARD;

void setup() {
  // put your setup code here, to run once:
  analogWriteResolution(12);
  digitalWrite(32, LOW);
  pinMode(13, OUTPUT);
  pinMode(32, OUTPUT);

  digitalWrite(13, HIGH);   // turn the LED on (HIGH is the voltage level)

  delay(2000); // delay to ensure serial port can connect before first output

  Serial.print("Initializing SD card...");

  if (!SD.begin(chipSelect))
  {
    Serial.println("initialization failed!");
    return;
  }
  Serial.println("initialization done.");

  

}

void loop()
{
  analogWrite(A21, 4095);
  analogWrite(A22, 4095);
  digitalWrite(13, HIGH);   // turn the LED on (HIGH is the voltage level)
  digitalWrite(32, HIGH);
  delay(100);
  digitalWrite(32, LOW);
  //  delay(10000);
  //  analogWrite(A21, 0);
  //  analogWrite(A22, 0);
  //  delay(500);

  int i = 0;
  myFile = SD.open("test.txt", O_READ);
  while (1)
  {
    if (myFile)
    {
      for (i = 0; i < 50000; i++)  //111000
      {
        int x = myFile.parseInt();
        analogWrite(A21, x);
        analogWrite(A22, x);
        //        int d = 2500;
        int d = x < 10 ? 1000 : 500;
        delayMicroseconds(d);
        Serial.println(x);
      }
      analogWrite(A21, 0);
      analogWrite(A22, 0);
    }
    myFile.close();
    digitalWrite(13, LOW);   // turn the LED on (HIGH is the voltage level)
  }

  // put your main code here, to run repeatedly:
  //  int i = 0;
  //  int r = random(0, 50);
  //  for(i = 0; i < 2; i++)
  //  {
  //    long r = random(0, 1000);
  //    analogWrite(A21, r);
  //    analogWrite(A22, r);
  //    long t =random(0, 50);
  //    delay(t);
  //    r = random(2000, 3000);
  //    analogWrite(A21, r);
  //    analogWrite(A22, r);
  //    t =random(0, 50);
  //    delay(t);
  //    r = random(1000, 2000);
  //    analogWrite(A21, r);
  //    analogWrite(A22, r);
  //    t =random(0, 50);
  //    delay(t);
  //    r = random(3000, 4095);
  //    analogWrite(A21, r);
  //    analogWrite(A22, r);
  //    t =random(0, 50);
  //    delay(t);
  //    r = random(2000, 2500);
  //    analogWrite(A21, r);
  //    analogWrite(A22, r);
  //    t =random(0, 50);
  //    delay(t);
  //    r = random(500, 1000);
  //    analogWrite(A21, r);
  //    analogWrite(A22, r);
  //    t = random(0, 50);
  //    delay(t);
  //  }
  //  r = random(1000, 4095);
  //  analogWrite(A21, r);
  //  analogWrite(A22, r);
  //  delay(400);

  //    analogWrite(A21, 4095);
  //    analogWrite(A22, 4095);
  //    long t = 100 + random(0, 500);
  //    delay(t);
  //
  //    analogWrite(A21, 0);
  //    analogWrite(A22, 0);
  //    t = 1000+ random(0, 3000);
  //    delay(t);

}
