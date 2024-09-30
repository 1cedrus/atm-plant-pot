#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <WebServer.h>
#include <EEPROM.h>
#include <cstring>
#include <cstdlib>
#include <cstdint>

#include "setup.h"
#include "led.h"


void setup() {
  Serial.begin(9600);
  EEPROM.begin(EEPROM_SIZE);

  if (!tryConnectWiFiInEEPROM()) {
    enableAPMode();
    form = _WIFI_SETUP_FORM;
    startWebServer();
  }

  while (WiFi.status() != WL_CONNECTED) {
    server.handleClient();
  }

  if (!tryConnectToBrokerInEEPROM()) {
    enableAPMode();
    form = _BROKER_SETUP_FORM;
    startWebServer();
  }

  while (!client.connected()) {
    server.handleClient();
  }

  stopWebServer();
  stopAPMode();
  EEPROM.end();
  Serial.println("INFO: Done setup!");
}

void loop() {
}

