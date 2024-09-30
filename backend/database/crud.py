from datetime import datetime

from fastapi.params import Depends
from sqlalchemy.orm import Session
from sqlalchemy.testing.plugin.plugin_base import config

from database.database import get_db
from models.models import Plant, MoistureReading, Weather, Config, Led, Watering
from schemas.schemas import PlantCreate, MoistureReadingCreate, WeatherCreate, ConfigCreate, LedCreate


# Plant CRUD operations
def create_plant(db: Session, plant: PlantCreate):
    db_plant = Plant(**plant.dict())
    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    return db_plant


def get_plants(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Plant).offset(skip).limit(limit).all()


def get_plant(db: Session, plant_id: int):
    return db.query(Plant).filter(Plant.id == plant_id).first()


# MoistureReading CRUD operations
def create_moisture_reading(db: Session, reading: MoistureReadingCreate, plant_id: int):
    db_reading = MoistureReading(**reading.dict(), plant_id=plant_id)
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    return db_reading


def get_moisture_readings(db: Session, skip: int = 0, limit: int = 10):
    return db.query(MoistureReading).offset(skip).limit(limit).all()

def get_moisture_readings_in_range(db: Session, plant_id: int ,from_: datetime, to: datetime):
    return db.query(MoistureReading).filter(MoistureReading.plant_id == plant_id, MoistureReading.timestamp >= from_, MoistureReading.timestamp <= to).all()

# Weather CRUD operations
def create_weather(db: Session, weather: WeatherCreate):
    db_weather = Weather(**weather.dict())
    db.add(db_weather)
    db.commit()
    db.refresh(db_weather)
    return db_weather


def get_weather(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Weather).offset(skip).limit(limit).all()


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


def get_leds(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Led).offset(skip).limit(limit).all()

def get_watering(db: Session, plant_id: int):
    return db.query(Watering).filter(Watering.plant_id == plant_id).first()

