from datetime import datetime
from pydoc_data.topics import topics

from passlib.context import CryptContext
import hashlib
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Time
from sqlalchemy.orm import relationship
from database.database import Base
from zoneinfo import ZoneInfo
from routers import topic

from routers.topic import WateringMode

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_md5(input_string: str) -> str:
    # Mã hóa chuỗi đầu vào thành bytes
    input_bytes = input_string.encode('utf-8')
    # Tạo đối tượng hash MD5
    md5_hash = hashlib.md5(input_bytes)
    # Trả về giá trị hash dưới dạng chuỗi hex
    return md5_hash.hexdigest()


def hash_password(password: str) -> str:
    return hash_md5(password)


class Plant(Base):
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)

    moisture_readings = relationship("MoistureReading", back_populates="plant")
    config = relationship("Config", back_populates="plant")
    led = relationship("Led", back_populates="plant")
    watering = relationship("Watering", back_populates="plant")
    water_level = relationship("WaterLevel", back_populates="plant")


class MoistureReading(Base):
    __tablename__ = "moisture_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Bangkok")))
    moisture_level = Column(Float)
    plant_id = Column(Integer, ForeignKey("plants.id"))

    plant = relationship("Plant", back_populates="moisture_readings")

    def to_dict(self):
        return {
            "moisture_level": self.moisture_level,
            "timestamp": self.timestamp.isoformat()
        }

class WaterLevel(Base):
    __tablename__ = "water_level"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Bangkok")))
    water_level = Column(Integer, default=0)
    plant_id = Column(Integer, ForeignKey("plants.id"))

    plant = relationship("Plant", back_populates="water_level")


class Config(Base):
    __tablename__ = "config"

    id = Column(Integer, primary_key=True, index=True)
    hash_password = Column(String, default=hash_password("1234"))
    real_time_position = Column(String, default="Hanoi")
    led_mode = Column(String, default=topic.LedMode.OFF.value)
    mode = Column(String, default=WateringMode.AUTOMATIC.value)
    plant_id = Column(Integer, ForeignKey("plants.id"))

    plant = relationship("Plant", back_populates="config")


class Led(Base):
    __tablename__ = "led"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="led")
    brightness = Column(Float, default=0.0)
    red = Column(Integer, default=0)
    green = Column(Integer, default=0)
    blue = Column(Integer, default=0)
    state = Column(Integer, default=topic.ALedMode.OFF.value)
    plant_id = Column(Integer, ForeignKey("plants.id"))

    plant = relationship("Plant", back_populates="led")

    def to_dict(self):
        return {
            "id": self.id,
            "brightness": self.brightness,
            "red": self.red,
            "green": self.green,
            "blue": self.blue,
            "state": self.state
        }


class Watering_Schedule(Base):
    __tablename__ = "watering_schedule"

    id = Column(Integer, primary_key=True, index=True)
    time = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Bangkok")))
    duration = Column(Integer, default=5)
    state = Column(Boolean, default=True)
    watering_id = Column(Integer, ForeignKey("watering.id"))

    watering = relationship("Watering", back_populates="watering_schedule")


class Watering(Base):
    __tablename__ = "watering"

    id = Column(Integer, primary_key=True, index=True)
    watering_threshold = Column(Float, default=0.0)
    watering_duration = Column(Integer, default=5)
    plant_id = Column(Integer, ForeignKey("plants.id"))

    plant = relationship("Plant", back_populates="watering")
    watering_schedule = relationship("Watering_Schedule", back_populates="watering")

class Weather(Base):
    __tablename__ = "weather"

    id = Column(Integer, primary_key=True, index=True)
    temp = Column(Float)
    humidity = Column(Float)
    conditions = Column(String)
    datetime = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Bangkok")))
    description = Column(String)
    cloudcover = Column(Float)
    precip = Column(Float)
    precipprob = Column(Float)
    solarradiation = Column(Float)
    icon = Column(String)

    def to_dict(self):
        return {
            "temp": self.temp,
            "humidity": self.humidity,
            "conditions": self.conditions,
            "datetime": self.datetime.isoformat(),
            "description": self.description,
            "cloudcover": self.cloudcover,
            "precip": self.precip,
            "precipprob": self.precipprob,
            "solarradiation": self.solarradiation,
            "icon": self.icon
        }
