#include <Arduino.h>
#include <stdlib.h>
#include "led.h"

LED::LED(Pins pins) : _color({0, 0, 0}), _state(false), _brightness_factor(1.0) {
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

void LED::setState(bool state) {
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

bool LED::getState() {
  return _state;
}

void LED::run(void *_pvParameters) {
  while (true) {
    analogWrite(_pins.red, (float) _color.red * _brightness_factor);
    analogWrite(_pins.blue, (float) _color.blue * _brightness_factor);
    analogWrite(_pins.green, (float) _color.green * _brightness_factor);
    vTaskDelay(100 / portTICK_PERIOD_MS);  // Delay for 100 ms
  }
}


