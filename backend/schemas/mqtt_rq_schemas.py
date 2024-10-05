from pydantic import BaseModel


class Item(BaseModel):
    message: str

class Threshold(BaseModel):
    threshold: int

class WateringMode(BaseModel):
    mode: int

class UpdateLedCustom(BaseModel):
    message: str