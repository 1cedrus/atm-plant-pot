#include <Arduino.h>
#include <stdlib.h>
#include "led.h"

LEDsMode led_mode = REALTIME;

float bnl_sun = 1.0;
float bnl_cloud = 1.0;

uint8_t rl_sun = 255;
uint8_t gl_sun = 255;
uint8_t bl_sun = 255;

uint8_t rl_cloud = 255;
uint8_t gl_cloud = 255;
uint8_t bl_cloud = 255;

// <sun|cloud>,<red>,<green>,<blue>,<brightness>
char* led_custom_topic = "cmnd/led/custom";

// <realtime|adaptive|custom>
char* led_mode_topic = "cmnd/led/mode";

void setupLEDs() {
  pinMode(RP_SUN, OUTPUT);
  pinMode(GP_SUN, OUTPUT);
  pinMode(BP_SUN, OUTPUT);

  pinMode(RP_CLOUD, OUTPUT);
  pinMode(GP_CLOUD, OUTPUT);
  pinMode(BP_CLOUD, OUTPUT);
}

void TaskLEDSun(void *pvParameters) {  
  while (true) {
    // Update the LED with the current color values
    setColor(rl_sun, gl_sun, bl_sun, RP_SUN, GP_SUN, BP_SUN, bnl_sun);
    vTaskDelay(100 / portTICK_PERIOD_MS);  // Delay for 100 ms
  }
}

void TaskLEDCloud(void *pvParameters) {  
  while (true) {
    // Update the LED with the current color values
    setColor(rl_cloud, gl_cloud, bl_cloud, RP_CLOUD, GP_CLOUD, BP_CLOUD, bnl_cloud);
    vTaskDelay(100 / portTICK_PERIOD_MS);  // Delay for 100 ms
  }
}

void setColor(uint8_t r, uint8_t g, uint8_t b, uint8_t pinR, uint8_t pinG, uint8_t pinB, float brightnessFactor) {
  analogWrite(pinR, (float) r * brightnessFactor);
  analogWrite(pinG, (float) g * brightnessFactor);
  analogWrite(pinB, (float) b * brightnessFactor);
}

