#ifndef MAIN_H
#define MAIN_H

#include <stdint.h>

#define PUBLISH_SOIL_MOISTURE_DURATION 4095 - 475 
#define PUBLISH_WATER_LEVEL_DURATION 5000
#define SOIL_MOISTURE_PIN 9
#define WATER_LEVEL_PIN 10
#define WATER_PUMP_PIN 11
#define DEFAULT_THRESHOLD 200
#define WAIT_FOR_CONNECTION 5000
#define DEFAULT_DURATION 10000

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
const char* AUTOMATIC_TOPIC = "cmnd/settings/automatic";

// Just now, use only to update watering mode
const char* MODE_TOPIC = "cmnd/settings/mode";

const char* CONNECTED_TOPIC = "cmnd/connected";

enum Mode {
  MANUAL,
  AUTOMATIC,
  REALTIME,
};

const char DELIMITER = ',';

void mqttCallback(char* topic, byte* payload, unsigned int length);
void mqttLoopTask(void* param);
void messageProcessor(void* param);
void publishSoilMoisture(void *_pvParameters);
void publishWaterLevel(void *_pvParameters);

typedef void (*TopicHandler)(int[], int);
typedef uint16_t Threshold;
typedef uint16_t Duration;

#endif