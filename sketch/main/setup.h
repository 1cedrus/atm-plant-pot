#ifndef SETUP_H
#define SETUP_H

#include <WebServer.h>
#include <PubSubClient.h>

void webServerOn(const char* formToShow);
void webServerOff(bool closeAPMode);
bool tryConnectWiFi(const char* ssid, const char* password);
bool tryConnectToBroker(const char* broker, const uint16_t port);
bool tryConnectWiFiInFlash();
bool tryConnectToBrokerInFlash();
void saveBrokerCredentials(const char* broker, uint16_t port);
void saveWiFiCredentials(const char* ssid, const char* password);
void handleBrokerForm();
void handleWiFiForm();
void startSoftAPMode();
void closeSoftAPMode();
void ensureConnection();


extern const char* AP_SSID;
extern const char* AP_PASSWORD;

extern const char* _WIFI_SETUP_FORM;
extern const char* _BROKER_SETUP_FORM;

extern const char* _FORM;

extern WebServer* server;
extern PubSubClient client;

#endif