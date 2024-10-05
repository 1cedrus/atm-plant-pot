from contextlib import asynccontextmanager
import asyncio

from fastapi import APIRouter, FastAPI
from iotcore import IotCore
from pydantic import BaseModel

from weather_api import periodic_weather_update

iot = IotCore()
router = APIRouter()


@asynccontextmanager
async def lifespan(app: FastAPI):
    iot.background_loop_forever()
    #add weather task to asyncio loop
    task = asyncio.create_task(periodic_weather_update())
    yield
    task.cancel()


