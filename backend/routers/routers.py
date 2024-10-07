from fastapi import HTTPException, Request

from fastapi import APIRouter
from fastapi.params import Depends, Query
from sqlalchemy.orm import Session
from starlette.types import HTTPExceptionHandler

from database.crud import get_config, get_moisture_readings_in_range, get_watering
from database.database import get_db
from models.models import Config
from routers.mqtt_router import water
from schemas.rq_schemas import Position, MoistureReadingScope, UpdateWateringMode, UpdateLedMode
from schemas.schemas import ConfigBase
from utils import pin_authenticate

router = APIRouter(prefix="/api")

@router.get("/position", tags=["position"])
async def get_position(config: ConfigBase = Depends(pin_authenticate)):
    position = config.real_time_position
    return {"positions": position}

@router.post("/position", tags=["position"])
async def update_position(request: Position, config: ConfigBase = Depends(pin_authenticate), db: Session = Depends(get_db)):
    config.real_time_position = request.position
    db.commit()
    return {"message": "success"}

@router.get("/soil-moisture", tags=["soil moisture"])
async def get_soil_moisture(request: MoistureReadingScope = Query(...) , config : Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    datas = get_moisture_readings_in_range(db, config.plant_id, request.from_, request.to)
    return {"soil_moistures": datas}

@router.get("/watering-mode", tags=["watering mode"])
async def get_watering_mode(config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    watering = get_watering(db, config.plant_id)
    if not watering:
        raise HTTPException(status_code=404, detail="Watering not found")
    return {"watering_mode": watering.watering_mode}

# @router.post("/watering-mode", tags=["watering mode"])
# async def update_watering_mode(request: UpdateWateringMode, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
#     watering = get_watering(db, config.plant_id)
#     if not watering:
#         raise HTTPException(status_code=404, detail="Watering not found")
#     watering.watering_mode = request.mode
#     db.commit()
#     return {"message": "success change watering mode to " + request.mode}

@router.post("/test", tags=["test"])
async def test(rq: Request):
    json_data = await rq.json()
    return {"message": "success", "data": json_data}

@router.get("/led-mode", tags=["led mode"])
async def get_led_mode(config: Config = Depends(pin_authenticate)):
    return {"led_mode": config.led_mode}

@router.post("/led-mode", tags=["led mode"])
async def update_led_mode(request: UpdateLedMode, config: Config = Depends(pin_authenticate), db: Session = Depends(get_db)):
    config.led_mode = request.mode
    db.commit()
    return {"message": "success change led mode to " + request.mode}