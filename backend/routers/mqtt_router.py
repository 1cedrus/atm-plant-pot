from fastapi import APIRouter, Depends, HTTPException
from pyexpat.errors import messages
from sqlalchemy.orm import Session
import asyncio

from sqlalchemy.testing.plugin.plugin_base import config

from exponent_server import simple_send_push_message
from routers.routers import weather
from utils import get_event_loop
from crud import create_moisture_reading, create_water_level, get_watering, set_led, create_watering_schedule, \
    get_all_token
from database.database import get_db, get_db_other
from models.models import Plant, Config, Watering_Schedule, Led, Watering, Weather
from mqtt import iot
from schemas.mqtt_rq_schemas import *
from routers import topic
from schemas.rq_schemas import UpdateWateringMode, UpdateLedMode
from utils import pin_authenticate
from ws import manager

router = APIRouter(prefix="/api/mqtt")

@iot.accept(topic=str(topic.Topic.CONNECT_TOPIC.value))
def send_data(request: str):
    print(f"Connected to broker with message: {request}")
    with get_db_other() as db:
        config = db.query(Config).first()
        if config:
            if config.mode == str(topic.WateringMode.MANUAL.value):
                message = "0"
            elif config.mode == str(topic.WateringMode.AUTOMATIC.value):
                message = "1"
            else:
                message = "2"
            iot.publish(str(topic.Topic.SETTINGS_TOPIC.value), message)
        watering = db.query(Watering).first()
        if watering:
            iot.publish(str(topic.Topic.AUTOMATIC_TOPIC.value),
                        f"{str(watering.watering_threshold)},{str(watering.watering_duration)}")
        if config.mode == topic.WateringMode.REALTIME.value:
            start_raining()
        if config.led_mode == str(topic.LedMode.REALTIME.value):
            start_led()
        elif config.led_mode == str(topic.LedMode.CUSTOM.value):
            leds = db.query(Led).all()
            if leds:
                for led in leds:
                    iot.publish(str(topic.Topic.LED_CUSTOM_TOPIC.value), f"{str(led.id)},{str(led.red)},{str(led.green)},{str(led.blue)},{str(led.brightness)},{str(led.state)}")


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
        if request == "1":
            all_token = get_all_token(db)
            for token in all_token:
                simple_send_push_message(token=str(token.token), title="Water tank is below 30%", message="Please refill")
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


def start_raining():
    with get_db_other() as db:
        weather = db.query(Weather).first()
        str_conditions = weather.conditions
        conditions = [x.strip() for x in str_conditions.split(",")]
        if any(c in ["type_2", "type_3", "type_4", "type_5", "type_6", "type_9", "type_10", "type_11", "type_13", "type_14", "type_21", "type_22", "type_23", "type_24", "type_25", "type_26"] for c in conditions):
            iot.publish(str(topic.Topic.WATER_PUMP_TOPIC.value), str(topic.Watering.ON.value))
            print("start raining")
        else:
            iot.publish(str(topic.Topic.WATER_PUMP_TOPIC.value), str(topic.Watering.OFF.value))
            print("stop raining")


def calculate_rgb_brightness():
    from zoneinfo import ZoneInfo
    now = datetime.now(ZoneInfo("Asia/Bangkok"))
    hour = now.hour

    # Giả lập tính toán màu sắc RGB và độ sáng dựa trên giờ
    if 6 <= hour <= 18:  # Ban ngày
        r = int(255 * (1 - abs(12 - hour) / 6))  # Giảm dần từ sáng đến tối
        g = int(255 * (1 - abs(12 - hour) / 6))
        b = int(150 * (1 - abs(12 - hour) / 6))  # Màu xanh dương nhạt
        brightness = int(255 * (1 - abs(12 - hour) / 6))
    else:  # Ban đêm
        r, g, b, brightness = 0, 0, 0, 0  # Tắt đèn vào ban đêm

    return r, g, b, brightness

def start_led():
    with get_db_other() as db:
        weather = db.query(Weather).first()
        str_conditions = weather.conditions
        conditions = [x.strip() for x in str_conditions.split(",")]
        leds = db.query(Led).all()
        if leds:
            r, g, b, brightness = calculate_rgb_brightness()
            iot.publish(str(topic.Topic.LED_CUSTOM_TOPIC.value),
                        f"1,{str(r)},{str(g)},{str(b)},{str(brightness)},{str(topic.ALedMode.ON.value)}")
            if any(c in ["type_18", "type_37", "type_38", "type_22", "type_24", "type_25"] for c in conditions):
                for i in range(1, len(leds)):
                    iot.publish(str(topic.Topic.LED_CUSTOM_TOPIC.value), f"{str(leds[i].id)},{str(leds[i].red)},{str(leds[i].green)},{str(leds[i].blue)},{str(leds[i].brightness)},{str(topic.ALedMode.STARLIGHT.value)}")
                    print(f"start led {leds[i].id}")
            else:
                for i in range(1, len(leds)):
                    iot.publish(str(topic.Topic.LED_CUSTOM_TOPIC.value), f"{str(leds[i].id)},{str(leds[i].red)},{str(leds[i].green)},{str(leds[i].blue)},{str(leds[i].brightness)},{str(topic.ALedMode.OFF.value)}")
                    print(f"stop led {leds[i].id}")

async def real_time_weather():
    print("real time weather")
    with get_db_other() as db:
        config = db.query(Config).first()
        if config.mode == topic.WateringMode.REALTIME.value:
            start_raining()
        if config.led_mode == topic.LedMode.REALTIME.value:
            start_led()


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
    # iot.publish(str(topic.Topic.SETTINGS_TOPIC.value), "0" if request.mode == topic.WateringMode.MANUAL.value else "1")
    if request.mode == str(topic.WateringMode.MANUAL.value):
        message = "0"
    elif request.mode == str(topic.WateringMode.AUTOMATIC.value):
        message = "1"
    else:
        message = "2"
    iot.publish(str(topic.Topic.SETTINGS_TOPIC.value), message)
    if request.mode == topic.WateringMode.REALTIME.value:
        start_raining()
    await manager.broadcast_json({"type": "watering_mode"})
    return {"message": "success change watering mode to " + str(request.mode)}


@router.post("/led-mode", tags=["led mode"])
async def update_led_mode(request: UpdateLedMode, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    config.led_mode = request.mode
    leds = db.query(Led).all()
    if leds:
        if request.mode == topic.LedMode.REALTIME.value:
            start_led()
        elif request.mode == topic.LedMode.OFF.value:
            for led in leds:
                # led.state = topic.ALedMode.OFF.value
                iot.publish(str(topic.Topic.LED_CUSTOM_TOPIC.value), f"{str(led.id)},{str(led.red)},{str(led.green)},{str(led.blue)},{str(led.brightness)},{str(topic.LedMode.OFF.value)}")
        else:
            for led in leds:
                iot.publish(str(topic.Topic.LED_CUSTOM_TOPIC.value), f"{str(led.id)},{str(led.red)},{str(led.green)},{str(led.blue)},{str(led.brightness)},{str(led.state)}")
    db.commit()
    await manager.broadcast_json({"type": "led_mode"})
    return {"message": "success change led mode to " + request.mode}