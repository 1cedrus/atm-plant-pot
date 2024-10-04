#ifndef MAIN_H
#define MAIN_H

#include <stdint.h>

#define PUBLISH_SOIL_MOISTURE_DURATION 2000 
#define PUBLISH_WATER_LEVEL_DURATION 5000
#define SOIL_MOISTURE_PIN 13
#define WATER_LEVEL_PIN 14
#define WATER_PUMP_PIN 15
#define DEFAULT_THRESHOLD 200
#define WAIT_FOR_CONNECTION 5000

struct Message {
  char topic[50];
  char payload[100];
};

// <sun|cloud>,<red>,<green>,<blue>,<brightness>,<state>
const char* LED_CUSTOM_TOPIC = "cmnd/led/custom";

// <on|off>
const char* WATER_PUMP_TOPIC = "cmnd/water/pump";

// Use to publish soil moisture to backend
const char* SOIL_MOISTURE_TOPIC = "cmnd/soil-moisture/data";

// Use to publish water level to backend
const char* WATER_LEVEL_TOPIC = "cmnd/water/level";

// Use to update threshold at mcu
const char* THRESHOLD_TOPIC = "cmnd/soil-moisture/threshold";

// Just now, use only to update watering mode
const char* SETTINGS_TOPIC = "cmnd/settings";

enum Mode {
  MANUAL,
  AUTOMATIC
};

const char DELIMITER = ',';

void mqttCallback(char* topic, byte* payload, unsigned int length);
void mqttLoopTask(void* param);
void messageProcessor(void* param);

typedef void (*TopicHandler)(int[], int);
typedef uint16_t Threshold;

#endif