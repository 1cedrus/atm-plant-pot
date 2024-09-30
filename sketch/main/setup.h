#include <WebServer.h>
#include <PubSubClient.h>

#ifndef SETUP_H
#define SETUP_H

#define EEPROM_SIZE 256

bool tryConnectWiFiInEEPROM();
bool tryConnectWiFi(const char* ssid, const char* password);
void startWebServer();
void stopWebServer();
bool tryConnectToBroker(const char* broker, const uint32_t port);
bool tryConnectToBrokerInEEPROM();
void saveBrokerCredentials(const char* broker, uint32_t port);
void saveWiFiCredentials(const char* ssid, const char* password);
void handleBrokerForm();
void handleWifiForm();
void enableAPMode();
void stopAPMode();

extern const char* AP_SSID;
extern const char* AP_PASSWORD;

extern char* _WIFI_SETUP_FORM;
extern char* _BROKER_SETUP_FORM;

extern char* form;

extern WebServer server;
extern PubSubClient client;

#endif