from contextlib import asynccontextmanager
import asyncio

from fastapi import APIRouter, FastAPI
from iotcore import IotCore
from pydantic import BaseModel

from database.database import SessionLocal
from database.db_init import init_db
from water_scheduler import init_scheduler, stop_scheduler
from weather_api import periodic_weather_update

iot = IotCore()

def init_db_session():
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    iot.background_loop_forever()
    #add weather task to asyncio loop
    task = asyncio.create_task(periodic_weather_update())
    # Gọi khởi tạo db và scheduler
    init_db_session()
    init_scheduler()
    yield
    task.cancel()
    stop_scheduler()


