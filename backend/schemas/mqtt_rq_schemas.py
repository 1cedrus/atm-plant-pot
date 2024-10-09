from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, validator, field_validator
from zoneinfo import ZoneInfo


class Item(BaseModel):
    message: str

class AutomacticSetting(BaseModel):
    threshold: int
    duration: int

class WateringMode(BaseModel):
    mode: str

class UpdateLedCustom(BaseModel):
    message: str

class WaterShedule(BaseModel):
    time: datetime
    duration: int
    state: bool


class UpdateWaterSchedule(BaseModel):
    schedules: list[WaterShedule] = []