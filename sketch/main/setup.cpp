#include <Arduino.h>
#include <EEPROM.h>
#include <PubSubClient.h>
#include <Preferences.h>
#include <WiFi.h>

#include "setup.h"

WebServer* server;
Preferences preferences;

const char* AP_SSID = "ESP32-IOT-PLANT_WATERING";
const char* AP_PASSWORD = "12345678";

const char* _WIFI_SETUP_FORM = R"rawliteral(
  <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial,sans-serif;background:#f0f0f0;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}.container{background:#fff;padding:15px;border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,0.1);width:280px;text-align:center}form{display:flex;flex-direction:column}input[type=text],input[type=password],input[type=submit]{padding:8px;margin:5px 0;border-radius:4px}input[type=submit]{background:#4CAF50;color:#fff;border:none;cursor:pointer}input[type=submit]:hover{background:#45a049}</style></head><body><div class="container"><h2>Wi-Fi Setup</h2><form action='/wifi' method='POST'><input type='text' name='ssid' placeholder='SSID'><input type='password' name='password' placeholder='Password'><input type='submit' value='Connect'></form></div></body></html>)rawliteral";

const char* _BROKER_SETUP_FORM = R"rawliteral(
    <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#f0f0f0;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}.container{background:#fff;padding:15px;border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,0.1);width:280px;text-align:center}form{display:flex;flex-direction:column}input[type=text],input[type=submit]{padding:8px;margin:5px 0;border-radius:4px}input[type=submit]{background:#4CAF50;color:#fff;border:none;cursor:pointer}input[type=submit]:hover{background:#45a049}</style></head><body><div class="container"><h2>Broker Setup</h2><form action='/broker' method='POST'><input type='text' name='broker' placeholder='Broker'><input type='text' name='port' placeholder='Port'><input type='submit' value='Connect'></form></div></body></html>)rawliteral";

const char* _FORM = "YOU NEED TO SET THE FORM YOURSELF!";

void ensureConnection() {
  Serial.begin(9600); 

  preferences.begin("app", false);

  if (!tryConnectWiFiInFlash()) {
    webServerOn(_WIFI_SETUP_FORM);

    while (WiFi.status() != WL_CONNECTED) {
      server->handleClient();
    }
  }

  if (!tryConnectToBrokerInFlash()) {
    webServerOn(_BROKER_SETUP_FORM);

    while (!client.connected()) {
      server->handleClient();
    }
  }

  webServerOff(true);
  preferences.end();
}

bool tryConnectWiFi(const char* ssid, const char* password) {
  bool isConnected = false;

  if (strlen(ssid) <= 0) {
    Serial.print("\n[ERROR]: SSID might not be an empty string!");
  } else {
    Serial.printf("\n[INFO]: Connecting to %s", ssid);

    WiFi.begin(ssid, password);

    int tryDelay = 1000;
    int numberOfTries = 5;

    while (!isConnected && numberOfTries) {
      numberOfTries--;

      Serial.print(".");
      if (WiFi.status() == WL_CONNECTED) {
        isConnected = true;
      }
      
      delay(tryDelay);
    }
  } 

  if (isConnected) {
    Serial.print("\n[INFO]: Wi-Fi is connected!");
    Serial.print("\n[INFO]: IP Address: ");
    Serial.print(WiFi.localIP());
  } else {
    // Stop reconnect to the WiFi
    WiFi.disconnect();
    Serial.println("\n[ERROR]: Failed to connect Wi-Fi.");  
  }
  
  return isConnected;
}

bool tryConnectToBroker(const char* broker, const uint16_t port) {
  bool isConnected = false;

  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("\n[ERROR]: Make sure you have WiFi connected first!");
  } else if (strlen(broker) <= 0) {
    Serial.print("\n[ERROR]: Broker address is empty string!");
  } else {
    Serial.printf("\n[INFO]: Connecting to the %s broker", broker);

    String id = "ESP32-CLIENT-" + String(WiFi.macAddress());  

    int tryDelay = 1000;
    int numberOfTries = 5;

    client.setServer(broker, port);

    while (!isConnected && numberOfTries) {
      numberOfTries--;

      Serial.print(".");
      if (client.connect(id.c_str())) {
        isConnected = true;
      }

      delay(tryDelay);
    }
    
    if (!isConnected) {
      Serial.printf("\n[ERROR]: Failed to connect to broker with state %d", client.state());
    }
  }

  if (isConnected) {
    Serial.printf("\n[INFO]: Connected to %s", broker);
  } else {
    Serial.print("\n[ERROR]: Failed to connect to broker");
  }

  return isConnected;
}

void webServerOn(const char* formToShow) {
  if (!WiFi.softAPIP()) {
    startSoftAPMode();
  }
  if (server != nullptr) {
    _FORM = formToShow;
  }
  else {
    server = new WebServer(80);

    _FORM = formToShow;
    server->on("/", HTTP_GET, []() {
      server->send(200, "text/html", _FORM);
    });
    server->on("/wifi", HTTP_POST, handleWiFiForm);
    server->on("/broker", HTTP_POST, handleBrokerForm);
  
    server->begin();
    Serial.print("\nINFO: WebServer started.");
  }
}

void webServerOff(bool closeAPMode) {
  if (!server) return;

  server->close();
  delete server;
  server = nullptr;

  if (closeAPMode && WiFi.softAPIP()) {
    closeSoftAPMode();
  }

  Serial.print("\nINFO: WebServer closed.");
}

bool tryConnectToBrokerInFlash() {
  String broker = preferences.getString("broker");
  uint16_t port = preferences.getUShort("port");

  if (broker.length() > 0) {
    return tryConnectToBroker(broker.c_str(), port);
  } 

  Serial.print("\nINFO: No broker credentials in EEPROM!");
  return false;
}

void startSoftAPMode() {
  if (WiFi.softAPIP()) return;

  Serial.print("\nINFO: Starting AP...");
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  Serial.print("\nINFO: AP IP address: ");
  Serial.print(WiFi.softAPIP());
}

void closeSoftAPMode() {
  if (!WiFi.softAPIP()) return;

  WiFi.softAPdisconnect(true);
  Serial.print("\nINFO: AP mode stopped!");
}

bool tryConnectWiFiInFlash() {
  String ssid = preferences.getString("ssid");
  String password = preferences.getString("password");

  if (ssid.length() > 0) {
    return tryConnectWiFi(ssid.c_str(), password.c_str());
  }

  Serial.print("\nINFO: No Wi-Fi credentials found in EEPROM.");
  return false;
}

void handleBrokerForm() {
  if (server->method() == HTTP_POST) {
    String broker = server->arg("broker");
    uint16_t port = static_cast<uint16_t>(atoi(server->arg("port").c_str()));

    Serial.printf("\n[INFO]: Received %s - %d", broker, port);

    if (tryConnectToBroker(broker.c_str(), port)) {
      saveBrokerCredentials(broker.c_str(), port);
    }
  } else {
    server->sendHeader("Location", "/", true); 
    server->send(302, "text/plain", "Redirecting...");
  }  
}

void handleWiFiForm() {
  if (server->method() == HTTP_POST) {
    String ssid = server->arg("ssid");
    String password = server->arg("password");

    if (tryConnectWiFi(ssid.c_str(), password.c_str())) {
      saveWiFiCredentials(ssid.c_str(), password.c_str());
    }
  } else {
    server->sendHeader("Location", "/", true); 
    server->send(302, "text/plain", "Redirecting...");
  }
}

void saveWiFiCredentials(const char* ssid, const char* password) {
  preferences.putString("ssid", ssid);
  preferences.putString("password", password);

  Serial.print("\n[INFO]: Wi-Fi credentials saved");
}

void saveBrokerCredentials(const char* broker, uint16_t port) {
  preferences.putString("broker", broker);
  preferences.putUShort("port", port);

  Serial.print("\n[INFO]: Broker credentials saved");
}
