from datetime import datetime, time
from typing import List, Optional

from pydantic import BaseModel



class MoistureReadingBase(BaseModel):
    timestamp: datetime
    moisture_level: float


class MoistureReadingCreate(MoistureReadingBase):
    pass


class MoistureReading(MoistureReadingBase):
    id: int
    plant_id: int

    class Config:
        orm_mode: True


class PlantBase(BaseModel):
    name: str
    description: Optional[str] = None


class PlantCreate(PlantBase):
    pass


class Plant(PlantBase):
    id: int
    moisture_readings: List[MoistureReading] = []
    config: Optional['Config'] = None
    led: Optional['Led'] = None
    watering: Optional['Watering'] = None

    class Config:
        orm_mode: True
        arbitrary_types_allowed = True  # Cho phép kiểu dữ liệu tùy chỉnh



class ConfigBase(BaseModel):
    hash_password: str
    real_time_position: str
    led_mode: str
    mode: str


class ConfigCreate(ConfigBase):
    pass


class Config(ConfigBase):
    id: int
    plant_id: int

    class Config:
        orm_mode: True


class LedBase(BaseModel):
    name: str
    brightness: float
    red: int
    green: int
    blue: int
    state: int


class LedCreate(LedBase):
    pass


class Led(LedBase):
    id: int
    plant_id: int

    class Config:
        orm_mode: True


class WateringScheduleBase(BaseModel):
    watering_time: time
    watering_duration: int


class WateringScheduleCreate(WateringScheduleBase):
    pass


class WateringSchedule(WateringScheduleBase):
    id: int
    watering_id: int

    class Config:
        orm_mode: True


class WateringBase(BaseModel):
    watering_threshold: float
    watering_duration: int


class WateringCreate(WateringBase):
    pass


class Watering(WateringBase):
    id: int
    plant_id: int
    watering_schedule: List[WateringSchedule] = []

    class Config:
        orm_mode: True
