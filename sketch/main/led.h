#ifndef LED_H
#define LED_H

#include <cstdint>

enum LEDMode {
  ON,
  // Don't no how to name it now! =))
  STARLIGHT,
  OFF,
};

struct Pins {
  uint8_t red;
  uint8_t green;
  uint8_t blue;
};

struct Color {
  uint8_t red;
  uint8_t green;
  uint8_t blue;
};

class LED {
  protected: 
    Pins _pins;
    Color _color;
    float _brightness_factor;
    LEDMode _state;
  
  public: 
    LED(Pins pins);
    ~LED();

    void setColor(Color color);
    void setBrightness(float factor);
    void setState(LEDMode mode);
    Color getColor();
    float getBrightness();
    LEDMode getState(); 
    void run(void *_pvParameters);
};
#endif