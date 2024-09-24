## **Data**

- **Soil Moisture (Backend)**
- **Water Tank Status** (Threshold Reached or Not)

## **API and Format**

### **1. Authentication API**

#### **Login Request**
```http
POST /login
{
    "pin": "NUMBER"    // User PIN
}
```

#### **Change Password Request**
```http
POST /change-password
{
    "pin": "NUMBER",       // Old PIN
    "new_pin": "NUMBER"    // New PIN
}
```

### **2. Data Retrieval and Update**

#### **Update Position (GET)**
```http
GET /update-position
{
    // No data provided, returns updated position
}
```

#### **Update Mode (GET)**
```http
GET /update-mode
{
    "mode": ["CUSTOM", "ADAPTIVE", "REALWEATHER"]   // Select the operating mode
}
```

#### **Retrieve Soil Moisture Data**
```http
GET /soil-moisture-data
{
    "from": "DATETIME",    // Starting time for data retrieval
    "to": "DATETIME"       // Ending time for data retrieval
}
```

##### **Response Example**
```json
{
    "data": [
        {
            "soil_moisture": "NUMBER",   // Moisture value
            "timestamp": "DATETIME"      // Time of data record
        }
    ],
    "from": "DATETIME",
    "to": "DATETIME"
}
```

### **3. LED Control**

#### **Update LED States**
```http
POST /update-led
{
    "led": [
        {
            "led_id": "NUMBER",         // LED identifier
            "brightness": "NUMBER",     // LED brightness level
            "color": "NUMBER",          // Color value for the LED
            "state": "BOOLEAN"          // LED ON/OFF state
        }
    ],
    "weather": ["MUA", "MUA_SAM", "NANG"]  // Weather conditions (e.g., "Rain", "Thunderstorm", "Sunny")
}
```

### **4. Irrigation Mode Control**

#### **Update Irrigation Mode**
```http
POST /update-irrigation-mode
{
    "duy_tri": "BOOLEAN"   // Maintain irrigation mode (true/false)
}
```

## **Websocket Data**

### **1. Weather Data**
```json
{
    "temp": "NUMBER",    // Temperature value
    "humid": "NUMBER"    // Humidity value
}
```

### **2. Soil Moisture Data**
```json
{
    "soil_moisture": "NUMBER"  // Current soil moisture level
}
```

### **3. Water Threshold Reached**
```json
{
    "run_out_water": "BOOLEAN"  // Water threshold reached (true/false)
}
```

---

## **Platform Support**

- **Android & Web**: Frontend platforms
- **Backend**: The backend system
- **ESP32 Code + Flash Code**: For managing hardware and embedded systems

---


