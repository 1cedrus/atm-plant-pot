import asyncio
from datetime import datetime

import httpx
import json

from fastapi import HTTPException
from fastapi.params import Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.models import Config, Weather
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

        return f"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{config.real_time_position}/today?key={APIKEY}&include=current&elements=temp,humidity,conditions,datetime,description,cloudcover,precip,precipprob,solarradiation,icon"

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error while fetching config")



# Hàm lấy dữ liệu thời tiết
async def fetch_weather_and_publish():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(get_weather_api_url())
            data = response.json()
            print(data)
            date_str = data["days"][0]["datetime"]
            time_str = data["currentConditions"]["datetime"]

            # Kết hợp chuỗi ngày và giờ
            datetime_str = f"{date_str} {time_str}"

            # Chuyển chuỗi thành đối tượng datetime
            datetime_obj = datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
            with get_db_session() as db:
                weather_data = db.query(Weather).first()
            if not weather_data:
                weather_data = Weather(datetime=datetime_obj,
                                       temp=data["currentConditions"]["temp"],
                                       humidity=data["currentConditions"]["humidity"],
                                       conditions=data["currentConditions"]["conditions"],
                                       description=data["days"][0]["description"],
                                       cloudcover=data["currentConditions"]["cloudcover"],
                                       precip=data["currentConditions"]["precip"],
                                       precipprob=data["currentConditions"]["precipprob"],
                                       solarradiation=data["currentConditions"]["solarradiation"],
                                       icon=data["currentConditions"]["icon"])
                db.add(weather_data)
                db.commit()
                db.refresh(weather_data)
            else:
                weather_data.datetime = datetime_obj
                weather_data.temp = data["currentConditions"]["temp"]
                weather_data.humidity = data["currentConditions"]["humidity"]
                weather_data.conditions = data["currentConditions"]["conditions"]
                weather_data.description = data["days"][0]["description"]
                weather_data.cloudcover = data["currentConditions"]["cloudcover"]
                weather_data.precip = data["currentConditions"]["precip"]
                weather_data.precipprob = data["currentConditions"]["precipprob"]
                weather_data.solarradiation = data["currentConditions"]["solarradiation"]
                weather_data.icon = data["currentConditions"]["icon"]
                db.commit()
                db.refresh(weather_data)

            # Xử lý dữ liệu thời tiết

            # Publish dữ liệu lên MQTT topic


        except Exception as e:
            print(f"Error fetching weather data: {e}")


# Hàm lấy dữ liệu mỗi giờ
async def periodic_weather_update():
    while True:
        await fetch_weather_and_publish()
        await asyncio.sleep(3600)

