#include <Arduino.h>
#include <EEPROM.h>
#include <WebServer.h>
#include <PubSubClient.h>
#include <WiFi.h>

#include "setup.h"

WiFiClient espClient;
WebServer server(80);
PubSubClient client(espClient);

const char* AP_SSID = "ESP32-IOT-PLANT_WATERING";
const char* AP_PASSWORD = "12345678";

char* _WIFI_SETUP_FORM = R"rawliteral(
  <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial,sans-serif;background:#f0f0f0;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}.container{background:#fff;padding:15px;border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,0.1);width:280px;text-align:center}form{display:flex;flex-direction:column}input[type=text],input[type=password],input[type=submit]{padding:8px;margin:5px 0;border-radius:4px}input[type=submit]{background:#4CAF50;color:#fff;border:none;cursor:pointer}input[type=submit]:hover{background:#45a049}</style></head><body><div class="container"><h2>Wi-Fi Setup</h2><form action='/wifi' method='POST'><input type='text' name='ssid' placeholder='SSID'><input type='password' name='password' placeholder='Password'><input type='submit' value='Connect'></form></div></body></html>)rawliteral";

char* _BROKER_SETUP_FORM = R"rawliteral(
    <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#f0f0f0;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}.container{background:#fff;padding:15px;border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,0.1);width:280px;text-align:center}form{display:flex;flex-direction:column}input[type=text],input[type=submit]{padding:8px;margin:5px 0;border-radius:4px}input[type=submit]{background:#4CAF50;color:#fff;border:none;cursor:pointer}input[type=submit]:hover{background:#45a049}</style></head><body><div class="container"><h2>Broker Setup</h2><form action='/broker' method='POST'><input type='text' name='broker' placeholder='Broker'><input type='text' name='port' placeholder='Port'><input type='submit' value='Connect'></form></div></body></html>)rawliteral";

char* form = "YOU NEED TO SET THE FORM YOURSELF!";

bool tryConnectWiFi(const char* ssid, const char* password) {
  if (strlen(ssid) > 0) {
    Serial.print("\nINFO: Connecting to ");
    Serial.print(ssid);

    WiFi.begin(ssid, password);

    for (int i = 0; i < 10; i++) {
      if (WiFi.status() == WL_CONNECTED) {
        Serial.print("\nINFO: Wi-Fi connected!");
        Serial.print("\nINFO: IP Address: ");
        Serial.print(WiFi.localIP());

        return true;
      }

      delay(1000);
      Serial.print(".");
    }
  } 
  
  Serial.println("\nERROR: Failed to connect Wi-Fi.");  
  return false;
}

bool tryConnectToBroker(const char* broker, const uint32_t port) {
  if (strlen(broker) > 0) {
    Serial.printf("\nINFO: Connecting to the %s broker", broker);

    String id = "ESP32-CLIENT-" + String(WiFi.macAddress());  
    client.setServer(broker, port);

    for (int i = 0; i < 5; i += 1) {
      if (client.connect(id.c_str())) {
        Serial.printf("\nINFO: Connected to %s", broker);
        return true;
      } else {
        Serial.print(".");
        delay(1000);
      }
    }

    Serial.printf("\nERROR: Failed to connect to broker with state %d", client.state());
  } else {
    Serial.print("\nERROR: Failed to connect to broker");
  }

  return false;
}

void startWebServer() {
  server.on("/", HTTP_GET, []() {
    server.send(200, "text/html", form);
  });

  server.on("/wifi", HTTP_POST, handleWifiForm);
  server.on("/broker", HTTP_POST, handleBrokerForm);
  
  server.begin();
  Serial.print("\nINFO: WebServer started.");
}

void stopWebServer() {
  server.close();
  Serial.print("\nINFO: WebServer closed.");
}

bool tryConnectToBrokerInEEPROM() {
  String broker = EEPROM.readString(128);
  uint32_t port = EEPROM.readUInt(192);

  if (broker.length() > 0) {
    return tryConnectToBroker(broker.c_str(), port);
  } 

  Serial.print("\nINFO: No broker credentials in EEPROM!");
  return false;
}

void enableAPMode() {
  if (WiFi.softAPIP()) return;

  Serial.print("\nINFO: Starting AP...");
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  Serial.print("\nINFO: AP IP address: ");
  Serial.print(WiFi.softAPIP());
}

void stopAPMode() {
  if (!WiFi.softAPIP()) return;

  WiFi.softAPdisconnect(true);
  Serial.print("\nINFO: AP mode stopped!");
}

bool tryConnectWiFiInEEPROM() {
  String ssid = EEPROM.readString(0);
  String password = EEPROM.readString(64);

  if (ssid.length() > 0) {
    return tryConnectWiFi(ssid.c_str(), password.c_str());
  }

  Serial.print("\nINFO: No Wi-Fi credentials found in EEPROM.");
  return false;
}

void handleBrokerForm() {
  if (server.method() == HTTP_POST) {
    String broker = server.arg("broker");
    uint32_t port = static_cast<uint32_t>(atoi(server.arg("port").c_str()));

    if (tryConnectToBroker(broker.c_str(), port)) {
      saveBrokerCredentials(broker.c_str(), port);
    }
  } else {
    server.send(200, "text/html", form);
  }  
}

void handleWifiForm() {
  if (server.method() == HTTP_POST) {
    String ssid = server.arg("ssid");
    String password = server.arg("password");

    if (tryConnectWiFi(ssid.c_str(), password.c_str())) {
      saveWiFiCredentials(ssid.c_str(), password.c_str());
    }
  } else {
    server.send(200, "text/html", form);
  }
}

void saveWiFiCredentials(const char* ssid, const char* password) {
  EEPROM.writeString(0, ssid);
  EEPROM.writeString(64, password);
  EEPROM.commit();

  Serial.print("\nINFO: Wi-Fi credentials saved");
}

void saveBrokerCredentials(const char* broker, uint32_t port) {
  EEPROM.writeString(128, broker);
  EEPROM.writeUInt(192, port);
  EEPROM.commit();

  Serial.print("\nINFO: Broker credentials saved");
}
