#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Preferences.h>
#include <cstring>
#include <cstdlib>
#include <cstdint>

#include "main.h"
#include "setup.h"
#include "led.h"

LED sun({5, 6, 7});
LED cloud_1({15, 16, 17});
LED cloud_2({35, 36, 37});

Threshold toWater = DEFAULT_THRESHOLD;
Duration timeToWater = DEFAULT_DURATION;

// Default set as AUTOMATIC
Mode wateringMode = AUTOMATIC;
TaskHandle_t autoWaterTask = NULL;
TaskHandle_t sunLED = NULL;

QueueHandle_t messageQueue;
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(9600);

  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(WATER_LEVEL_PIN, INPUT); 
  pinMode(WATER_PUMP_PIN, OUTPUT);

  preferences.begin("app", true);
  toWater = preferences.getUShort("threashold", DEFAULT_THRESHOLD);
  timeToWater = preferences.getUShort("duration", DEFAULT_DURATION);
  preferences.end();

  // Just run at AUTOMATIC mode till smt get update by backend
  xTaskCreate(autoWater, "AutoWater", 2048, NULL, 1, &autoWaterTask);
  ensureConnection();

  messageQueue = xQueueCreate(20, sizeof(Message));

  client.setCallback(mqttCallback);
  client.subscribe(LED_CUSTOM_TOPIC, 1);
  client.subscribe(WATER_PUMP_TOPIC, 1);
  client.subscribe(MODE_TOPIC, 1);
  client.subscribe(AUTOMATIC_TOPIC, 1);
  client.publish(CONNECTED_TOPIC, "HELLOWORLD", 10);

  xTaskCreatePinnedToCore(publishSoilMoisture, "PublishSoilMoisture", 2048, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(publishWaterLevel, "PublisWaterLevel", 2048, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(messageProcessor, "MessageProcessor", 4095, NULL, 2, NULL, 0);
  xTaskCreatePinnedToCore(mqttLoopTask, "MqttLoop", 2048, NULL, 1, NULL, 1);
  xTaskCreate(
    [](void* pvParameters) {
        LED* led = static_cast<LED*>(pvParameters);
        led->run(pvParameters);
    }, 
    "LEDSun", 
    2048, 
    &sun,
    3, 
    &sunLED
  );
  xTaskCreate(
    [](void* pvParameters) {
        LED* led = static_cast<LED*>(pvParameters);
        led->run(pvParameters);
    }, 
    "LEDCloud_One", 
    2048, 
    &cloud_1,
    1, 
    NULL
  );
  xTaskCreate(
    [](void* pvParameters) {
        LED* led = static_cast<LED*>(pvParameters);
        led->run(pvParameters);
    }, 
    "LEDCloud_Two", 
    2048, 
    &cloud_2,
    1, 
    NULL
  );

  Serial.print("\n[INFO]: Done setup!");
}

void loop() {
  // Nothing to do in here!!
}

void mqttLoopTask(void* param) {
  while (true) {
    while (!client.connected()) {
      // Just ensure plants not gonna die cuz lack of water =)
      // It will be reset to user settings when the client reconnect
      wateringMode = AUTOMATIC;
      vTaskResume(autoWaterTask);

      preferences.begin("app", true);
      while (!tryConnectToBrokerInFlash()) {}
      client.subscribe(LED_CUSTOM_TOPIC, 1);
      client.subscribe(WATER_PUMP_TOPIC, 1);
      client.subscribe(MODE_TOPIC, 1);
      client.subscribe(AUTOMATIC_TOPIC, 1);
      client.publish(CONNECTED_TOPIC, "HELLOWORLD", 10);
      preferences.end();
    }

    client.loop();
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Message msg;
  strncpy(msg.topic, topic, sizeof(msg.topic));
  strncpy(msg.payload, (char*)payload, length);
  msg.payload[length] = '\0';

  Serial.printf("\n[INFO]: Received at %s with %s", msg.topic, msg.payload);
  
  xQueueSend(messageQueue, &msg, portMAX_DELAY);
}

void messageProcessor(void* param) {
  Message msg;
  TopicHandler handler;

  while (true) {
    if (xQueueReceive(messageQueue, &msg, portMAX_DELAY)) {
      Serial.printf("\n[INFO]: Processing messsage from %s with %s", msg.topic, msg.payload);
      
      int payload[10];
      int payloadLength;

      char *token = strtok(msg.payload, &DELIMITER);

      for (payloadLength = 0; token != nullptr && payloadLength < 10; payloadLength += 1) {
        payload[payloadLength] = atoi(token);
        token = strtok(nullptr, &DELIMITER);
      }

      if (!strcmp(msg.topic, LED_CUSTOM_TOPIC)) {
        handler = ledCustom;
      } else if (!strcmp(msg.topic, WATER_PUMP_TOPIC)) {
        handler = waterPump;
      } else if (!strcmp(msg.topic, AUTOMATIC_TOPIC)) {
        handler = automatic;
      } else if (!strcmp(msg.topic, MODE_TOPIC)) {
        handler = mode;
      }

      handler(payload, payloadLength);
    }
  }
}

void publishSoilMoisture(void *_pvParameters) {
  char psSoilMoisture[10];
  int nLastTimeUpdate = 0;

  while (true) {
    if (client.state() != MQTT_CONNECTED) {
      vTaskDelay(WAIT_FOR_CONNECTION / portTICK_PERIOD_MS);  
      continue;
    }

    int nSoilMoisture = analogRead(SOIL_MOISTURE_PIN);

    if (abs(nLastTimeUpdate - nSoilMoisture) > 100) {
      itoa(nSoilMoisture, psSoilMoisture, 10);
      client.publish(SOIL_MOISTURE_TOPIC, psSoilMoisture, strlen(psSoilMoisture));

      Serial.printf("\n[INFO]: Publish soil moisture %d", nSoilMoisture);

      nLastTimeUpdate = nSoilMoisture;
    }

    vTaskDelay(PUBLISH_SOIL_MOISTURE_DURATION / portTICK_PERIOD_MS);  
  }
}

void publishWaterLevel(void *_pvParameters) {
  bool bLastTimeUpdate = 0;

  while (true) {
    if (client.state() != MQTT_CONNECTED) {
      vTaskDelay(WAIT_FOR_CONNECTION / portTICK_PERIOD_MS);  
      continue;
    }

    int bWaterLevel = analogRead(WATER_LEVEL_PIN);

    if (bLastTimeUpdate != bWaterLevel) {
      client.publish(WATER_LEVEL_TOPIC, bWaterLevel ? "1" : "0", 1);

      bLastTimeUpdate = bWaterLevel;
    }

    vTaskDelay(PUBLISH_WATER_LEVEL_DURATION / portTICK_PERIOD_MS);  
  }
}

void autoWater(void *_pvParameters) {
  while (true) {
    // Not put delay here on purpuse cuz this task get suspend when wateringMode == MANUAL
    if (wateringMode != AUTOMATIC) continue;

    int nSoilMoisture = analogRead(SOIL_MOISTURE_PIN);

    digitalWrite(WATER_PUMP_PIN, nSoilMoisture < toWater ? HIGH : LOW);

    // TODO! Need a different value.
    vTaskDelay(PUBLISH_SOIL_MOISTURE_DURATION / portTICK_PERIOD_MS);  
  }
}

void ledCustom(int payload[], int payloadLength) {
  if (payloadLength != 6) {
    Serial.print("\n[ERROR]: Payload format is not correct!");
  } else {
    LED* selectedLED = payload[0] == 1 ? &sun : (payload[0] == 2 ? &cloud_1 : &cloud_2);

    selectedLED->setColor({ payload[1], payload[2], payload[3] });
    selectedLED->setState(static_cast<LEDMode>(payload[5]));
    selectedLED->setBrightness((float) payload[4] / 255);
  }
}

void waterPump(int payload[], int payloadLength) {
  if (payloadLength != 1) {
    Serial.print("\n[ERROR]: Payload format is not correct!");
  } else {
    digitalWrite(WATER_PUMP_PIN, payload[0] ? HIGH : LOW);
  }
}

void automatic(int payload[], int payloadLength) {
  if (payloadLength != 2) {
    Serial.print("\n[ERROR]: Payload format is not correct!");
  } else {
    toWater = static_cast<Threshold>(payload[0]);
    timeToWater = static_cast<Duration>(payload[1]);

    preferences.begin("app", false);
    preferences.putUShort("threashold", toWater);
    preferences.putUShort("duration", timeToWater);
    preferences.end();
  }
}

void mode(int payload[], int payloadLength) {
  if (payloadLength != 1) {
    Serial.print("\n[ERROR]: Payload format is not correct!");
  } else if (wateringMode != payload[0]) {
    wateringMode = static_cast<Mode>(payload[0]);

    switch (wateringMode) {
      case AUTOMATIC:
        vTaskResume(autoWaterTask);
        break;
      case MANUAL:
        vTaskSuspend(autoWaterTask);
        break;
    }
  }
}
