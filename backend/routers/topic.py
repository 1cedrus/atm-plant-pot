from enum import Enum

class Topic(Enum):
    LED_CUSTOM_TOPIC = "cmnd/led/custom"
    LED_MODE_TOPIC = "cmnd/led/mode"
    WATER_PUMP_TOPIC = "cmnd/water/pump"
    SOIL_MOISTURE_TOPIC = "cmnd/soil-moisture/data"
    WATER_LEVEL_TOPIC = "cmnd/water/level"
    THRESHOLD_TOPIC = "cmnd/soil-moisture/threshold"
    SETTINGS_TOPIC = "cmnd/settings"

class Watering(Enum):
    ON = 1
    OFF = 0

class WateringMode(Enum):
    MANUAL = 0
    AUTOMATIC = 1