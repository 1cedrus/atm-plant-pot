from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from iotcore import IotCore
from pydantic import BaseModel

iot = IotCore()
router = APIRouter()


@asynccontextmanager
async def lifespan(app: FastAPI):
    iot.background_loop_forever()
    yield


@iot.accept(topic="temperature")
def temperature_data(request):
    print(f"Temperature data : {request}")


@iot.accept(topic="cmnd/led/custom")
def temperature_data(request):
    print(f"Receive data : {request}")


def mqtt_callback(data):
    print(f"iot >: {data}")


@router.get("/sub")
def sub():
    iot.subscribe("iot", mqtt_callback)
    return {"response": "subscribed"}


@router.get("/pub")
def pub():
    iot.publish("temperature", "{'temp': 21}")
    return {"response": "published"}


class Item(BaseModel):
    message: str


@router.post("/led_custom")
def led_custom(item: Item):
    print(item)
    iot.publish("cmnd/led/custom", item.message)
    return {"response": "send data: " + item.message + " to pub cmnd/led/custom"}


@router.post("/led_mode")
def led_custom(request: str):
    iot.publish("cmnd/led/mode", request)
    return {"response": "send data: " + request + " to pub cmnd/led/mode"}
