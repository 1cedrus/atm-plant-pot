from datetime import datetime

from fastapi import HTTPException
from fastapi.params import Depends
from sqlalchemy.orm import Session
from sqlalchemy.testing.plugin.plugin_base import config

from database.database import get_db
from models.models import Plant, MoistureReading, Config, Led, Watering, WaterLevel, Watering_Schedule, Weather, ExpoToken
from schemas.mqtt_rq_schemas import WaterShedule
from schemas.schemas import PlantCreate, MoistureReadingCreate, ConfigCreate, LedCreate
from schemas import schemas


# Plant CRUD operations
def create_plant(db: Session, plant: PlantCreate):
    db_plant = Plant(**plant.dict())
    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    return db_plant


def get_plant(db: Session, plant_id: int):
    return db.query(Plant).filter(Plant.id == plant_id).first()


# MoistureReading CRUD operations
def create_moisture_reading(db: Session, moisture: str, plant_id: int):
    db_reading = MoistureReading(moisture_level=float(moisture), plant_id=plant_id)
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    return db_reading

def get_moisture_readings(db: Session, plant_id: int ,from_: datetime | None = None, to: datetime | None = None):
    if from_ is None and to is None:
        return db.query(MoistureReading).filter(MoistureReading.plant_id == plant_id).order_by(MoistureReading.timestamp.desc()).first()
    return db.query(MoistureReading).filter(MoistureReading.plant_id == plant_id, MoistureReading.timestamp >= from_, MoistureReading.timestamp <= to).all()


# Config CRUD operations
def create_config(db: Session, config: ConfigCreate, plant_id: int):
    db_config = Config(**config.dict(), plant_id=plant_id)
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config


def get_config(db: Session):
    return db.query(Config).first()


# Led CRUD operations
def create_led(db: Session, led: LedCreate, plant_id: int):
    db_led = Led(**led.dict(), plant_id=plant_id)
    db.add(db_led)
    db.commit()
    db.refresh(db_led)
    return db_led


def get_leds(db: Session):
    return db.query(Led).all()

def set_led(db: Session, led_id: int, red: int, green: int, blue: int, state: int, brightness: int):
    db_led = db.query(Led).filter(Led.id == led_id).first()
    if not db_led:
        return None
    db_led.red = red
    db_led.green = green
    db_led.blue = blue
    db_led.state = state
    db_led.brightness = brightness
    db.commit()
    db.refresh(db_led)
    return db_led

def get_watering(db: Session, plant_id: int):
    return db.query(Watering).filter(Watering.plant_id == plant_id).first()

def create_water_level(db: Session, water_level: int, plant_id: int):
    db_water_level = WaterLevel(water_level=water_level, plant_id=plant_id)
    db.add(db_water_level)
    db.commit()
    db.refresh(db_water_level)
    return db_water_level

def get_water_level(db: Session, plant_id: int):
    return db.query(WaterLevel).filter(WaterLevel.plant_id == plant_id).order_by(WaterLevel.timestamp.desc()).first()

# def create_watering_schedules(db: Session, water_id: int, schedules: list[dict]):
#     for schedule in schedules:
#         db_schedule = Watering_Schedule(**schedule, watering_id=water_id)
#         db.add(db_schedule)
#         db.commit()
#         db.refresh(db_schedule)
#     return True

def create_watering_schedule(db: Session, water_id: int, schedule: WaterShedule):
    db_schedule = Watering_Schedule(**schedule.dict(), watering_id=water_id)
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def update_watering_schedule(db: Session, schedule_id: int, schedule: WaterShedule):
    db_schedule = db.query(Watering_Schedule).filter(Watering_Schedule.id == schedule_id).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    for key, value in schedule.dict().items():
        setattr(db_schedule, key, value)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def delete_watering_schedule(db: Session, schedule_id: int):
    db_schedule = db.query(Watering_Schedule).filter(Watering_Schedule.id == schedule_id).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(db_schedule)
    db.commit()
    return True

def get_weather(db: Session):
    return db.query(Weather).order_by(Weather.datetime.desc()).first()

def create_expo_token(db: Session, token: str):
    exist_token = db.query(ExpoToken).filter(ExpoToken.token==token).first()
    if not exist_token:
        exist_token = ExpoToken(token=token)
        db.add(exist_token)
        db.commit()
        db.refresh(exist_token)
    return exist_token

def get_all_token(db: Session):
    all_token = db.query(ExpoToken).all()
    return all_token
