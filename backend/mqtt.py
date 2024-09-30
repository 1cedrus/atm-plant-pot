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


