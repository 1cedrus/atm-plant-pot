from datetime import timezone, timedelta
from sys import prefix

from fastapi import HTTPException, Request

from fastapi import APIRouter
from fastapi.params import Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.database import get_db
from models.models import Config
from schemas.mqtt_rq_schemas import WaterShedule
from schemas.schemas import ConfigBase
from utils import pin_authenticate
from water_scheduler import add_a_schedule

router = APIRouter(prefix='/api')



@router.post('/reminder')
def new_scheduler(request: WaterShedule, db: Session = Depends(get_db), config: Config = Depends(pin_authenticate)):
    from crud import create_watering_schedule
    print("new_scheduler: ", request.time, type(request.time))
    request.time = request.time.astimezone(tz=timezone(timedelta(hours=7))) # convert to UTC+7
    watering_schedule = create_watering_schedule(db, config.plant_id , request)
    add_a_schedule(watering_schedule.id, watering_schedule.time.hour, watering_schedule.time.minute)

@router.post("/reminder/{reminder_id}")
def update_scheduler(request: WaterShedule, reminder_id: int, db: Session = Depends(get_db), config: Config = Depends(pin_authenticate)):
    from crud import update_watering_schedule
    request.time = request.time.astimezone(tz=timezone(timedelta(hours=7)))
    return update_watering_schedule(db, reminder_id , request)

@router.delete('/reminder/{reminder_id}')
def delete_scheduler(reminder_id: int, db: Session = Depends(get_db), config: Config = Depends(pin_authenticate)):
    from crud import delete_watering_schedule
    return delete_watering_schedule(db, reminder_id)

