#include <SoftPWM.h>

void setup()
{
  SoftPWMBegin();
  
  SoftPWMSet(5, 0);
  SoftPWMSetFadeTime(13, 1000, 1000);
}

void loop()
{
  SoftPWMSet(5, 255);
  delay(1000);
  SoftPWMSet(5, 0);
  delay(1000);
}
