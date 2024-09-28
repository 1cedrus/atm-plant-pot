#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <cstring>
#include <cstdlib>
#include <cstdint>

#include "led.h"

void connectWifi();
void setupMQTT();
void MQTTCallback(char *topic, byte *payload, unsigned int length);

// WiFi
const char *ssid = "TUPHAN"; // Enter your Wi-Fi name
const char *password = "12345678";  // Enter Wi-Fi password

// MQTT Broker
const char *mqtt_broker = "broker.emqx.io";
const char *mqtt_username = "tuphan";
const char *mqtt_password = "1";
const int mqtt_port = 1883;

const char* delimiter = ",";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(9600);

  connectWifi();
  setupMQTT();
  setupLEDs();

  // Tạo task điều khiển LED 1
  xTaskCreate(
    TaskLEDSun,   // Hàm task thực thi
    "LEDSun",     // Tên của task
    1024,       // Kích thước stack
    NULL,       // Tham số truyền vào task
    1,          // Độ ưu tiên
    NULL        // Không sử dụng task handle
  );

  // Tạo task điều khiển LED 2
  xTaskCreate(
    TaskLEDCloud,   // Hàm task thực thi
    "LEDCloud",     // Tên của task
    1024,       // Kích thước stack
    NULL,       // Tham số truyền vào task
    1,          // Độ ưu tiên
    NULL        // Không sử dụng task handle
  );
}

void loop() {
  client.loop();
}

void MQTTCallback(char *topic, byte *payload, unsigned int length) {
  Serial.print("Message arrived in topic: ");
  Serial.println(topic);

  char data[length];
  for (int i = 0; i < length; i += 1) {
    data[i] = (char) payload[i]; 
  }

  char* token = strtok(data, delimiter);  // Get the first token

  while (token != nullptr) {
    if (strcmp(topic, led_mode_topic) == 0) {
      led_mode = static_cast<LEDsMode>(atoi(token));
    } else if (strcmp(topic, led_custom_topic) == 0) {
      LED led = static_cast<LED>(atoi(token));
      
      if (led == SUN) {
        token = strtok(nullptr, delimiter);
        rl_sun = static_cast<uint8_t>(atoi(token));

        token = strtok(nullptr, delimiter);
        gl_sun = static_cast<uint8_t>(atoi(token));

        token = strtok(nullptr, delimiter);
        bl_sun = static_cast<uint8_t>(atoi(token));

        token = strtok(nullptr, delimiter);
        char *endPtr;            
        float bn = strtof(token, &endPtr);

        bnl_sun = bn;
      } else if (led == CLOUD) {
        token = strtok(nullptr, delimiter);
        rl_cloud = static_cast<uint8_t>(atoi(token));

        token = strtok(nullptr, delimiter);
        gl_cloud = static_cast<uint8_t>(atoi(token));

        token = strtok(nullptr, delimiter);
        bl_cloud = static_cast<uint8_t>(atoi(token));

        token = strtok(nullptr, delimiter);
        char *endPtr;            
        float bn = strtof(token, &endPtr);

        bnl_cloud = bn;
      }
    }

    token = strtok(nullptr, delimiter);  // Get the next token
  }

  Serial.println("-----------------------");
}

void setupMQTT() {
  client.setServer(mqtt_broker, mqtt_port);
  client.setCallback(MQTTCallback);

  while (!client.connected()) {
      String client_id = "esp32-client-";
      client_id += String(WiFi.macAddress());
      Serial.printf("The client %s connects to the public MQTT broker\n", client_id.c_str());
      if (client.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
          Serial.println("Public EMQX MQTT broker connected");
      } else {
          Serial.print("failed with state ");
          Serial.print(client.state());
          delay(2000);
      }
  }

  // Publish and subscribe
  //client.publish(topic, "Hi, I'm ESP32 ^^");
  client.subscribe(led_custom_topic);
  client.subscribe(led_mode_topic);
}

void connectWifi() {
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.println("Connecting to WiFi..");
  }

  Serial.println("Connected to the Wi-Fi network");
}
