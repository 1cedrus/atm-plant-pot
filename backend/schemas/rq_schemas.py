from datetime import datetime, time

from pydantic import BaseModel


class Position(BaseModel):
    position: str

#get list moisture readings from database
class MoistureReadingScope(BaseModel):
    from_: datetime | None = None
    to: datetime | None = None

class UpdateWateringMode(BaseModel):
    mode: str

class UpdateLedMode(BaseModel):
    mode: str

# class Reminder(BaseModel):
#     time: datetime
#     duration: int
#     state: bool