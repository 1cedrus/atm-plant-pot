from datetime import datetime

from pydantic import BaseModel


class Position(BaseModel):
    position: str

#get list moisture readings from database
class MoistureReadingScope(BaseModel):
    from_: datetime
    to: datetime

class UpdateWateringMode(BaseModel):
    mode: str

class UpdateLedMode(BaseModel):
    mode: str