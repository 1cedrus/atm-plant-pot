import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Time
from sqlalchemy.orm import relationship

from database import Base
from utils import hash_password


class Plant(Base):
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)

    moisture_readings = relationship("MoistureReading", back_populates="plant")
    config = relationship("Config", back_populates="plant")
    led = relationship("Led", back_populates="plant")
    watering = relationship("Watering", back_populates="plant")


class MoistureReading(Base):
    __tablename__ = "moisture_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    moisture_level = Column(Float)
    plant_id = Column(Integer, ForeignKey("plants.id"))

    plant = relationship("Plant", back_populates="moisture_readings")


class Weather(Base):
    __tablename__ = "weather"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    condition = Column(String)  # nắng, mưa, sấm chớp, v.v.
    temperature = Column(Float)
    humidity = Column(Float)


class Config(Base):
    __tablename__ = "config"

    id = Column(Integer, primary_key=True, index=True)
    hash_password = Column(String, default=hash_password("1234"))
    real_time_position = Column(String, default="0,0")
    led_mode = Column(String, default="auto")
    operation_mode = Column(String, default="ADAPTIVE")
    plant_id = Column(Integer, ForeignKey("plants.id"))

    plant = relationship("Plant", back_populates="config")


class Led(Base):
    __tablename__ = "led"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="led")
    brightness = Column(Float, default=0.0)
    color = Column(String, default="white")
    is_on = Column(Boolean, default=False)
    plant_id = Column(Integer, ForeignKey("plants.id"))

    plant = relationship("Plant", back_populates="led")


class Watering_Schedule(Base):
    __tablename__ = "watering_schedule"

    id = Column(Integer, primary_key=True, index=True)
    watering_time = Column(Time, default=datetime.datetime.utcnow().time)
    watering_duration = Column(Integer, default=5)
    watering_id = Column(Integer, ForeignKey("watering.id"))

    watering = relationship("Watering", back_populates="watering_schedule")


class Watering(Base):
    __tablename__ = "watering"

    id = Column(Integer, primary_key=True, index=True)
    watering_mode = Column(String, default="auto")
    watering_threshold = Column(Float, default=0.0)
    watering_duration = Column(Integer, default=5)
    plant_id = Column(Integer, ForeignKey("plants.id"))

    plant = relationship("Plant", back_populates="watering")
    watering_schedule = relationship("Watering_Schedule", back_populates="watering")
