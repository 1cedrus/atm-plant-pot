from pydoc_data.topics import topics

from fastapi import HTTPException, Request

from fastapi import APIRouter
from fastapi.params import Depends, Query
from sqlalchemy.orm import Session
from typing_extensions import TypedDict

from crud import get_moisture_readings, get_watering, get_water_level, get_weather, get_leds, create_expo_token
from database.database import get_db
from models.models import Config, Watering, Watering_Schedule, Led
from routers import topic
from routers.topic import WateringMode
from schemas.rq_schemas import Position, MoistureReadingScope, UpdateLedMode, ExpoToken
from schemas.schemas import ConfigBase
from utils import pin_authenticate
from schemas import schemas
from weather_api import fetch_weather_and_publish
from ws import manager

router = APIRouter(prefix="/api")

@router.get("/position", tags=["position"])
async def get_position(config: ConfigBase = Depends(pin_authenticate)):
    position = config.real_time_position
    return {"positions": position}

@router.post("/position", tags=["position"])
async def update_position(request: Position, config: ConfigBase = Depends(pin_authenticate), db: Session = Depends(get_db)):
    try :
        if await fetch_weather_and_publish(request.position):
            config.real_time_position = request.position
            db.commit()
            await manager.broadcast_json({"type": "weather"})
        else:
            raise HTTPException(status_code=400, detail="Error when fetch weather")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error when fetch weather")
    return {"message": "success"}

@router.get("/soil-moisture", tags=["soil moisture"])
async def get_soil_moisture(request: MoistureReadingScope = Query() , config : Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    datas = get_moisture_readings(db, config.plant_id, request.from_, request.to)
    # Nếu là một danh sách, chuyển đổi từng item thành Pydantic model
    if not datas:
        raise HTTPException(status_code=404, detail="Moisture reading not found")
    if isinstance(datas, list):
        return [schemas.MoistureReadingBase.from_orm(data) for data in datas]

    # Nếu chỉ có một đối tượng, chuyển đổi trực tiếp
    return schemas.MoistureReadingBase.from_orm(datas)

@router.get("/watering-mode", tags=["watering mode"])
async def get_watering_mode(mode: str | None = None, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    if not mode:
        return config.mode
    elif mode == WateringMode.AUTOMATIC.value:
        watering = db.query(Watering).filter(Watering.plant_id == config.plant_id).order_by(Watering.id.desc()).first()
        return {"threshold": watering.watering_threshold, "duration": watering.watering_duration}
    elif mode == WateringMode.MANUAL.value:
        schedules = db.query(Watering_Schedule).order_by(Watering_Schedule.time).all()
        return {"reminders": [{"id": schedule.id , "time": schedule.time, "duration": schedule.duration, "state": schedule.state} for schedule in schedules]}

# @router.get("/watering-mode", tags=["watering mode"]):
# async def get_watering_mode(mode: str, config: Config = Depends(pin_authenticate)):
#     return config.mode

@router.get("/led-mode", tags=["led mode"])
async def get_led_mode(config: Config = Depends(pin_authenticate)):
    return config.led_mode


@router.get("/led-settings", tags=["led settings"])
async def get_led_settings(config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    leds = get_leds(db)
    if not leds:
        raise HTTPException(status_code=404, detail="Led not found")
    return [led.to_dict() for led in leds]

@router.get("/water-level", tags=["water level"])
async def water_level(config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    water_level = get_water_level(db, config.plant_id)
    if not water_level:
        raise HTTPException(status_code=404, detail="Water level not found")
    return {"water_level": water_level.water_level}

@router.get("/weather", tags=["weather"])
async def weather(config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    weather = get_weather(db)
    if not weather:
        raise HTTPException(status_code=404, detail="Weather not found")
    return weather.to_dict()


@router.post("/expo-push-token", tags=["expo token"])
def save_token(token: ExpoToken, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    my_token = create_expo_token(db, token.token)
    return {"message": "Save token successfully"}

