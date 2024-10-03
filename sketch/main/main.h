#ifndef MAIN_H
#define MAIN_H

struct Message {
  char topic[50];
  char payload[100];
};

// <sun|cloud>,<red>,<green>,<blue>,<brightness>,<state>
const char* LED_CUSTOM_TOPIC = "cmnd/led/custom";

// <on|off>
const char* WATER_PUMP_TOPIC = "cmnd/water/pump";

// Use to publish soil moisture to backend
const char* SOIL_MOISTURE_TOPIC = "cmnd/soil-moisture";

// Use to publish water level to backend
const char* WATER_LEVEL_TOPIC = "cmnd/water/level";

const char DELIMITER = ',';

void mqttCallback(char* topic, byte* payload, unsigned int length);
void mqttLoopTask(void* param);
void messageProcessor(void* param);

typedef void (*TopicHandler)(int[], int);

#endif