import asyncio
import httpx
import json

from fastapi import HTTPException
from fastapi.params import Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.models import Config
from utils import APIKEY

from sqlalchemy.orm import Session
from contextlib import contextmanager
from database.database import SessionLocal

@contextmanager
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_weather_api_url():
    try:
        with get_db_session() as db:
            config = db.query(Config).first()

        if not config or not config.real_time_position:
            raise HTTPException(status_code=404, detail="Configuration not found or incomplete")

        return f"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{config.real_time_position}/today?key={APIKEY}&include=current&elements=temp,humidity,conditions,datetime,description,cloudcover,precip,precipprob,solarradiation"

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error while fetching config")


# Hàm lấy dữ liệu thời tiết
async def fetch_weather_and_publish():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(get_weather_api_url())
            data = response.json()

            # Xử lý dữ liệu thời tiết
            print(data)
            # Publish dữ liệu lên MQTT topic


        except Exception as e:
            print(f"Error fetching weather data: {e}")


# Hàm lấy dữ liệu mỗi giờ
async def periodic_weather_update():
    while True:
        await fetch_weather_and_publish()
        await asyncio.sleep(3600)

