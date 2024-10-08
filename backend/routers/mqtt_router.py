from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import asyncio
from utils import get_event_loop
from crud import create_moisture_reading, create_water_level, get_watering, set_led, create_watering_schedule
from database.database import get_db, get_db_other
from models.models import Plant, Config
from mqtt import iot
from schemas.mqtt_rq_schemas import *
from routers.topic import Topic, Watering
from schemas.rq_schemas import UpdateWateringMode
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

        # Chạy coroutine và chờ hoàn thành
        get_event_loop().run_until_complete(manager.broadcast_json({"type": "moisture", "data": moisture_data.to_dict()}))
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
        get_event_loop().run_until_complete(manager.broadcast_json({"type": "water_level" , "data": request}))
        print(f"Water level data : {request}")
    finally:
        db.close()


@router.post("/led_custom", tags=["led custom"])
def led_custom(request: UpdateLedCustom, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    list_params = request.message.split(",")
    if len(list_params) != 6:
        raise HTTPException(status_code=400, detail="Invalid data")
    led_id, red, green, blue, brightness, state = map(int, list_params)
    set_led(db, led_id, red, green, blue, state, brightness)
    iot.publish(str(Topic.LED_CUSTOM_TOPIC.value), request.message)
    return {"response": "send data: " + request.message + " to pub cmnd/led/custom"}


@router.get("/water", tags=["water"])
def water():
    iot.publish(str(Topic.WATER_PUMP_TOPIC.value), Watering.ON.value)
    return {"response": "water on"}

@router.get("/stop-water", tags=["water"])
def water():
    iot.publish(str(Topic.WATER_PUMP_TOPIC.value), Watering.OFF.value)
    return {"response": "water off"}

async def watering_job(duration: int):
    iot.publish(str(Topic.WATER_PUMP_TOPIC.value), Watering.ON.value)
    await asyncio.sleep(duration)
    iot.publish(str(Topic.WATER_PUMP_TOPIC.value), Watering.OFF.value)

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
    config.mode = request.mode
    db.commit()
    iot.publish(str(Topic.SETTINGS_TOPIC.value), request.mode)
    return {"message": "success change watering mode to " + str(request.mode)}

@router.post("/water-schedule", tags=["update watering schedule"])
async def update_water_schedule(request: UpdateWaterSchedule, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    watering = get_watering(db, config.plant_id)
    if not watering:
        raise HTTPException(status_code=404, detail="Watering not found")
    create_watering_schedule(db, watering.id, request.schedules)
    return {"message": "success change watering schedule" }