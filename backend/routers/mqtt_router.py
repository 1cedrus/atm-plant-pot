from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import asyncio

from sqlalchemy.testing.plugin.plugin_base import config

from utils import get_event_loop
from crud import create_moisture_reading, create_water_level, get_watering, set_led, create_watering_schedule
from database.database import get_db, get_db_other
from models.models import Plant, Config, Watering_Schedule, Led, Watering
from mqtt import iot
from schemas.mqtt_rq_schemas import *
from routers import topic
from schemas.rq_schemas import UpdateWateringMode
from utils import pin_authenticate
from ws import manager

router = APIRouter(prefix="/api/mqtt")

@iot.accept(topic=str(topic.Topic.CONNECT_TOPIC.value))
def send_data(request: str):
    print(f"Connected to broker with message: {request}")
    with get_db_other() as db:
        leds = db.query(Led).all()
        if leds:
            for led in leds:
                iot.publish(str(topic.Topic.LED_CUSTOM_TOPIC.value), f"{str(led.id)},{str(led.red)},{str(led.green)},{str(led.blue)},{str(led.brightness)},{str(led.state)}")
        config = db.query(Config).first()
        if config:
            iot.publish(str(topic.Topic.SETTINGS_TOPIC.value),
                        "0" if config.mode == str(topic.WateringMode.MANUAL.value) else "1")
        watering = db.query(Watering).first()
        if watering:
            iot.publish(str(topic.Topic.AUTOMATIC_TOPIC.value), f"{str(watering.watering_threshold)},{str(watering.watering_duration)}")


@iot.accept(topic=str(topic.Topic.SOIL_MOISTURE_TOPIC.value))
def soil_moisture_data(request: str):
    with get_db_other() as db:
        plant_id = db.query(Plant).first().id
        if plant_id:
             moisture_data = create_moisture_reading(db, moisture=request, plant_id=plant_id)
        else:
            raise HTTPException(status_code=404, detail="Plant not found")
        print(f"Soil moisture data : {request}")

        # Chạy coroutine và chờ hoàn thành
        get_event_loop().run_until_complete(manager.broadcast_json({"type": "moisture"}))


@iot.accept(topic=str(topic.Topic.WATER_LEVEL_TOPIC.value))
def water_level_data(request: str):
    with get_db_other() as db:
        plant_id = db.query(Plant).first().id
        if plant_id:
            create_water_level(db, water_level=int(request), plant_id=plant_id)
        else:
            raise HTTPException(status_code=404, detail="Plant not found")
        get_event_loop().run_until_complete(manager.broadcast_json({"type": "water_level" }))
        print(f"Water level data : {request}")



@router.post("/led-custom", tags=["led custom"])
async def led_custom(request: UpdateLedCustom, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    list_params = request.message.split(",")
    if len(list_params) != 6:
        raise HTTPException(status_code=400, detail="Invalid data")
    led_id, red, green, blue, brightness, state = map(int, list_params)
    set_led(db, led_id, red, green, blue, state, brightness)
    iot.publish(str(topic.Topic.LED_CUSTOM_TOPIC.value), request.message)
    # await manager.broadcast_json({"type": "custom"})
    return {"response": "send data: " + request.message + " to pub cmnd/led/custom"}


@router.get("/water", tags=["water"])
def water():
    iot.publish(str(topic.Topic.WATER_PUMP_TOPIC.value), str(topic.Watering.ON.value))
    return {"response": "water on"}

@router.get("/stop-water", tags=["water"])
def water():
    iot.publish(str(topic.Topic.WATER_PUMP_TOPIC.value), str(topic.Watering.OFF.value))
    return {"response": "water off"}

async def watering_job(scheduler_id: int):
    print(f"watering job {scheduler_id} try to run")
    with get_db_other() as db:
        config = db.query(Config).first()
        watering_schedule = db.query(Watering_Schedule).filter(Watering_Schedule.id == scheduler_id).first()
        if not watering_schedule:
            return None
        if config.mode == topic.WateringMode.MANUAL.value and watering_schedule.state:
            iot.publish(str(topic.Topic.WATER_PUMP_TOPIC.value), str(topic.Watering.ON.value))
            await asyncio.sleep(watering_schedule.duration)
            iot.publish(str(topic.Topic.WATER_PUMP_TOPIC.value), str(topic.Watering.OFF.value))
            print(f"watering job {scheduler_id} run successfully")

@router.post("/automatic", tags=["automatic watering"])
async def automatic_setting(request: AutomacticSetting, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    watering = get_watering(db, config.plant_id)
    if not watering:
        raise HTTPException(status_code=404, detail="Watering not found")
    watering.watering_threshold = request.threshold
    watering.watering_duration = request.duration
    db.commit()
    iot.publish(str(topic.Topic.AUTOMATIC_TOPIC.value), str(request.threshold) + ";" + str(request.duration))
    await manager.broadcast_json({"type": "automatic"})
    return {"response": "set threshold and duration : " + str(request.threshold) + ";" + str(request.duration)}


@router.post("/watering-mode", tags=["update watering mode"])
async def update_watering_mode(request: UpdateWateringMode, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    config.mode = request.mode
    db.commit()
    if request.mode == topic.WateringMode.MANUAL.value:
        pass
    iot.publish(str(topic.Topic.SETTINGS_TOPIC.value), "0" if request.mode == topic.WateringMode.MANUAL.value else "1")
    await manager.broadcast_json({"type": "watering_mode"})
    return {"message": "success change watering mode to " + str(request.mode)}
