from fastapi import APIRouter, FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.util import await_only
from watchfiles import awatch
import asyncio

from database.crud import create_moisture_reading, create_water_level, get_watering, set_led
from database.database import get_db, get_db_other
from models.models import Plant, Config
from mqtt import iot
from schemas.mqtt_rq_schemas import *
from routers.topic import Topic, Watering
from schemas.rq_schemas import UpdateWateringMode, UpdateLedMode
from schemas.schemas import MoistureReading
from utils import pin_authenticate
from ws import manager

router = APIRouter(prefix="/api/mqtt")

@iot.accept(topic=str(Topic.SOIL_MOISTURE_TOPIC.value))
def soil_moisture_data(request: str):
    db = get_db_other()
    try:
        plant_id = db.query(Plant).first().id
        if plant_id:
             moisture_data = create_moisture_reading(db, moisture=request, plant_id=plant_id)
        else:
            raise HTTPException(status_code=404, detail="Plant not found")
        print(f"Soil moisture data : {request}")
        # moisture_data_d = MoistureReading(**moisture_data).dict()
        # print(moisture_data_d)
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            # Nếu không có event loop nào đang chạy, tạo một cái mới
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        # Chạy coroutine và chờ hoàn thành
        loop.run_until_complete(manager.broadcast_json("{'moisture': " + request + "}"))
    finally:
        db.close()

@iot.accept(topic=str(Topic.WATER_LEVEL_TOPIC.value))
def water_level_data(request: str):
    db = get_db_other()
    try:
        plant_id = db.query(Plant).first().id
        if plant_id:
            create_water_level(db, water_level=int(request), plant_id=plant_id)
        else:
            raise HTTPException(status_code=404, detail="Plant not found")
        print(f"Water level data : {request}")
    finally:
        db.close()




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

@iot.accept(topic=str(Topic.LED_CUSTOM_TOPIC.value))
def led_custom_data(request: str):
    print(f"Led custom data : {request}")


@router.post("/led_custom", tags=["led custom"])
def led_custom(request: UpdateLedCustom, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    list_params = request.message.split(",")
    if len(list_params) != 6:
        raise HTTPException(status_code=400, detail="Invalid data")
    led_id, red, green, blue, brightness, state = map(int, list_params)
    set_led(db, led_id, red, green, blue, state, brightness)
    iot.publish(str(Topic.LED_CUSTOM_TOPIC.value), request.message)
    return {"response": "send data: " + request.message + " to pub cmnd/led/custom"}


# @router.post("/led-mode", tags=["led mode"])
# async def update_led_mode(request: UpdateLedMode, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
#     config.led_mode = request.mode
#     db.commit()
#     iot.publish(Topic.LED_MODE_TOPIC, request)
#     return {"message": "success change led mode to " + request.mode}


@router.get("/water", tags=["water"])
def water():
    iot.publish(str(Topic.WATER_PUMP_TOPIC.value), Watering.ON.value)
    return {"response": "water on"}

@router.get("/stop-water", tags=["water"])
def water():
    iot.publish(str(Topic.WATER_PUMP_TOPIC.value), Watering.OFF.value)
    return {"response": "water off"}

@router.post("/threshold")
def set_threshold(request: Threshold, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    watering = get_watering(db, config.plant_id)
    if not watering:
        raise HTTPException(status_code=404, detail="Watering not found")
    watering.watering_threshold = request.threshold
    db.commit()
    iot.publish(str(Topic.THRESHOLD_TOPIC.value), request.threshold)
    return {"response": "set threshold: " + str(request.threshold)}


@router.post("/watering-mode", tags=["update watering mode"])
async def update_watering_mode(request: UpdateWateringMode, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    watering = get_watering(db, config.plant_id)
    if not watering:
        raise HTTPException(status_code=404, detail="Watering not found")
    watering.watering_mode = request.mode
    db.commit()
    iot.publish(str(Topic.SETTINGS_TOPIC.value), request.mode)
    return {"message": "success change watering mode to " + str(request.mode)}
