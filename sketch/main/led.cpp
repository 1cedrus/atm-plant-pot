#include <stdint.h>
#include <Arduino.h>
#include <stdlib.h>
#include "led.h"

LED::LED(Pins pins) : _color({0, 0, 0}), _state(OFF), _brightness_factor(1.0) {
  _pins = pins;

  pinMode(_pins.red, OUTPUT);
  pinMode(_pins.green, OUTPUT);
  pinMode(_pins.blue, OUTPUT);
}

LED::~LED() {
  // todo!
}

void LED::setColor(Color color) {
  _color = color;

}

void LED::setState(LEDMode state) {
  _state = state;
} 

void LED::setBrightness(float factor) {
  _brightness_factor = factor;
}

Color LED::getColor() {
  return _color;
}

float LED::getBrightness() {
  return _brightness_factor;
}

LEDMode LED::getState() {
  return _state;
}

void LED::run(void *_pvParameters) {
  // This is for STARLIGHT 
  uint8_t starCount = random(2);
  uint8_t brightness = 255;

  while (true) {
    switch (_state) {
      case ON:
        analogWrite(_pins.red, (float) _color.red * _brightness_factor);
        analogWrite(_pins.blue, (float) _color.blue * _brightness_factor);
        analogWrite(_pins.green, (float) _color.green * _brightness_factor);
        break;
      case OFF: 
        analogWrite(_pins.red, 0);
        analogWrite(_pins.blue, 0);
        analogWrite(_pins.green, 0);
        break;
      case STARLIGHT:
        float brightnessFactor = (float) brightness / 255;
        analogWrite(_pins.red, (float) _color.red * brightnessFactor);
        analogWrite(_pins.blue, (float) _color.blue * brightnessFactor);
        analogWrite(_pins.green, (float) _color.green * brightnessFactor);

        brightness -= 255 / 10;
        if (random(1) || brightness <= 0) {
          brightness = 255;
          starCount -= 1;
        } 

        if (starCount == 0) {
          starCount = random(2);
        }
    }

    vTaskDelay(100 / portTICK_PERIOD_MS);  // Delay for 100 ms
  }
}


