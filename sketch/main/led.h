#include <cstdint>

#ifndef LED_H
#define LED_H

void TaskLEDSun(void *pvParameters);
void TaskLEDCloud(void *pvParameters);
void setupLEDs();
void setColor(uint8_t r, uint8_t g, uint8_t b, uint8_t pinR, uint8_t pinG, uint8_t pinB, float brightnessFactor);

enum LED {
  SUN,
  CLOUD
};

enum LEDsMode {
  REALTIME,
  ADAPTIVE,
  CUSTOM
};

#define RP_SUN 16  // Chân điều khiển LED RGB 1 (màu đỏ)
#define GP_SUN 17  // Chân điều khiển LED RGB 1 (màu xanh lá)
#define BP_SUN 18  // Chân điều khiển LED RGB 1 (màu xanh dương)

#define RP_CLOUD 35  // Chân điều khiển LED RGB 2 (màu đỏ)
#define GP_CLOUD 36  // Chân điều khiển LED RGB 2 (màu xanh lá)
#define BP_CLOUD 37  // Chân điều khiển LED RGB 2 (màu xanh dương)

extern float bnl_sun;
extern float bnl_cloud;

extern uint8_t rl_sun;
extern uint8_t gl_sun;
extern uint8_t bl_sun;

extern uint8_t rl_cloud;
extern uint8_t gl_cloud;
extern uint8_t bl_cloud;

extern LEDsMode led_mode;

// <sun|cloud>,<red>,<green>,<blue>,<brightness>
extern char* led_custom_topic;

// <realtime|adaptive|custom>
extern char* led_mode_topic;

#endif