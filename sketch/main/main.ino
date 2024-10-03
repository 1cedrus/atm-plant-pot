#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <cstring>
#include <cstdlib>
#include <cstdint>

#include "main.h"
#include "setup.h"
#include "led.h"

LED sun({16, 17, 18});
LED cloud({35, 36, 37});

#define PUBLISH_SOIL_MOISTURE_DURATION 2000 
#define PUBLISH_WATER_LEVEL_DURATION 5000
#define SOIL_MOISTURE_PIN 13
#define WATER_LEVEL_PIN 14
#define WATER_PUMP_PIN 15

QueueHandle_t messageQueue;
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(9600);
  ensureConnection();

  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(WATER_LEVEL_PIN, INPUT);

  messageQueue = xQueueCreate(20, sizeof(Message));

  client.setCallback(mqttCallback);
  client.subscribe(LED_CUSTOM_TOPIC, 1);
  client.subscribe(WATER_PUMP_TOPIC, 1);

  xTaskCreatePinnedToCore(publishSoilMoisture, "PublishSoilMoisture", 2048, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(publishWaterLevel, "PublisWaterLevel", 2048, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(messageProcessor, "MessageProcessor", 2048, NULL, 2, NULL, 0);
  xTaskCreatePinnedToCore(mqttLoopTask, "MqttLoop", 2048, NULL, 1, NULL, 1);
  xTaskCreate(
    [](void* pvParameters) {
        LED* led = static_cast<LED*>(pvParameters);
        led->run(pvParameters);
    }, 
    "LEDSun", 
    2048, 
    &sun,
    1, 
    NULL
  );
  xTaskCreate(
    [](void* pvParameters) {
        LED* led = static_cast<LED*>(pvParameters);
        led->run(pvParameters);
    }, 
    "LEDCloud", 
    2048, 
    &cloud,  // Pass 'this' as the task parameter
    1, 
    NULL
  );

  Serial.println("INFO: Done setup!");
}

void loop() {
  // Nothing to do in here!!
}

void mqttLoopTask(void* param) {
  while (client.state() == MQTT_CONNECTED) {
    client.loop();
  }

  // TODO! What to do if WiFi or Client is disconnecting
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Message msg;
  strncpy(msg.topic, topic, sizeof(msg.topic));
  strncpy(msg.payload, (char*)payload, length);
  msg.payload[length] = '\0';
  
  xQueueSend(messageQueue, &msg, portMAX_DELAY);
}

void messageProcessor(void* param) {
  Message msg;
  TopicHandler handler;

  while (true) {
    if (xQueueReceive(messageQueue, &msg, portMAX_DELAY)) {
      int payload[10];
      int payloadLength = 0;

      char *token = strtok(msg.payload, &DELIMITER);

      for (payloadLength = 0; token != nullptr && payloadLength < 10; payloadLength += 1) {
        payload[i] = atoi(token);
        token = strtok(nullptr, &DELIMITER);
      }

      if (strcmp(msg.topic, LED_CUSTOM_TOPIC)) {
        handler = ledCustom;
      } else if (strcmp(msg.topic, WATER_PUMP_TOPIC)) {
        handler = waterPump;
      }

      handler(payload, payloadLength);
    }
  }
}

void publishSoilMoisture(void *_pvParameters) {
  char *psSoilMoisture;
  int nLastTimeUpdate = 0;

  while (true) {
    int nSoilMoisture = analogRead(SOIL_MOISTURE_PIN);

    if (nLastTimeUpdate != nSoilMoisture) {
      itoa(nSoilMoisture, psSoilMoisture, 10);
      client.publish(SOIL_MOISTURE_TOPIC, psSoilMoisture, strlen(psSoilMoisture));
    }

    vTaskDelay(PUBLISH_SOIL_MOISTURE_DURATION / portTICK_PERIOD_MS);  
  }
}

void publishWaterLevel(void *_pvParameters) {
  bool bLastTimeUpdate = 0;

  while (true) {
    bool bWaterLevel = digitalRead(WATER_LEVEL_PIN);

    if (bLastTimeUpdate != bWaterLevel) {
      client.publish(WATER_LEVEL_TOPIC, bWaterLevel ? "0" : "1", 1);
    }

    vTaskDelay(PUBLISH_WATER_LEVEL_DURATION / portTICK_PERIOD_MS);  
  }
}

void ledCustom(int payload[], int payloadLength) {
  if (payloadLength != 5) {
    Serial.print("\n[ERROR]: Payload format is not correct!");
  } else {
    LED selectedLED = payload[0] == 0 ? sun : cloud;

    selectedLED.setColor({ payload[1], payload[2], payload[3] });
    selectedLED.setState(payload[5]);
    selectedLED.setBrightness((float) payload[4] / 255);
  }
}

void waterPump(int payload[], int payloadLength) {
  if (payloadLength != 1) {
    Serial.print("\n[ERROR]: Payload format is not correct!");
  } else {
    digitalWrite(WATER_PUMP_PIN, payload[0] ? HIGH : LOW);
  }
}

