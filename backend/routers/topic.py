from enum import Enum

class Topic(Enum):
    LED_CUSTOM_TOPIC = "cmnd/led/custom"
    # LED_MODE_TOPIC = "cmnd/led/mode"
    WATER_PUMP_TOPIC = "cmnd/water/pump"
    SOIL_MOISTURE_TOPIC = "cmnd/soil-moisture/data"
    WATER_LEVEL_TOPIC = "cmnd/water/level"
    AUTOMATIC_TOPIC = "cmnd/settings/automatic"
    SETTINGS_TOPIC = "cmnd/settings/mode"
    CONNECT_TOPIC = "cmnd/connected"

class Watering(Enum):
    ON = 1
    OFF = 0

class WateringMode(Enum):
    MANUAL = 'manual'
    AUTOMATIC = 'automatic'
    REALTIME = 'realtime'

class LedMode(Enum):
    REALTIME = 'realtime'
    CUSTOM = 'custom'
    OFF = 'off'

class ALedMode(Enum):
    ON = 0
    STARLIGHT = 1
    OFF = 2
