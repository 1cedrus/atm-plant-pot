from fastapi import APIRouter, FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.crud import create_moisture_reading, create_water_level, get_watering, set_led
from database.database import get_db
from models.models import Plant, Config
from mqtt import iot
from schemas.mqtt_rq_schemas import *
from routers.topic import Topic, Watering
from schemas.rq_schemas import UpdateWateringMode, UpdateLedMode
from utils import pin_authenticate

router = APIRouter(prefix="/api/mqtt", tags=["mqtt"])

@iot.accept(topic=str(Topic.SOIL_MOISTURE_TOPIC))
def soil_moisture_data(request: str, db: Session = Depends(get_db)):
    plant_id = db.query(Plant).first().id
    create_moisture_reading(db, moisture=request, plant_id=plant_id)
    print(f"Soil moisture data : {request}")

@iot.accept(topic=str(Topic.WATER_LEVEL_TOPIC))
def water_level_data(request: str, db: Session = Depends(get_db)):
    plant_id = db.query(Plant).first().id
    create_water_level(db, water_level=int(request), plant_id=plant_id)
    print(f"Water level data : {request}")


# def mqtt_callback(data):
#     print(f"iot >: {data}")
#
#
# @router.get("/sub")
# def sub():
#     iot.subscribe("iot", mqtt_callback)
#     return {"response": "subscribed"}
#
#
# @router.get("/pub")
# def pub():
#     iot.publish("iot", "{'temp': 21}")
#     return {"response": "published"}


@router.post("/led_custom")
def led_custom(request: UpdateLedCustom, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    list_params = request.message.split(",")
    if len(list_params) != 5:
        raise HTTPException(status_code=400, detail="Invalid data")
    led_id, red, green, blue, brightness, state = map(int, list_params)
    set_led(db, led_id, red, green, blue, state, brightness)
    iot.publish(Topic.LED_CUSTOM_TOPIC, request.message)
    return {"response": "send data: " + request.message + " to pub cmnd/led/custom"}


@router.post("/led-mode", tags=["led mode"])
async def update_led_mode(request: UpdateLedMode, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    config.led_mode = request.mode
    db.commit()
    iot.publish(Topic.LED_MODE_TOPIC, request)
    return {"message": "success change led mode to " + request.mode}


@router.get("/water", tags=["water"])
def water():
    iot.publish(Topic.WATER_PUMP_TOPIC, Watering.ON)
    return {"response": "water on"}

@router.get("/stop-water", tags=["water"])
def water():
    iot.publish(Topic.WATER_PUMP_TOPIC, Watering.OFF)
    return {"response": "water off"}

@router.post("/threshold")
def set_threshold(request: Threshold):
    iot.publish(Topic.THRESHOLD_TOPIC, request.threshold)
    return {"response": "set threshold: " + str(request.threshold)}


@router.post("/watering-mode", tags=["update watering mode"])
async def update_watering_mode(request: UpdateWateringMode, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    watering = get_watering(db, config.plant_id)
    if not watering:
        raise HTTPException(status_code=404, detail="Watering not found")
    watering.watering_mode = request.mode
    db.commit()
    iot.publish(Topic.SETTINGS_TOPIC, request.mode)
    return {"message": "success change watering mode to " + str(request.mode)}
