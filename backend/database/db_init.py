from sqlalchemy.orm import Session

from models.models import Plant, Led, Config, Watering, Watering_Schedule, WaterLevel
from routers.topic import WateringMode, LedMode, ALedMode
from schemas.schemas import PlantCreate, LedCreate, ConfigCreate
from utils import hash_password
from water_scheduler import add_all_schedule


# ham khoi tao db
def init_db(db: Session):
    global db_plant, default_watering
    plant = db.query(Plant).first()
    if not plant:
        default_plant = PlantCreate(name="default", description="default plant")
        db_plant = Plant(**default_plant.model_dump())
        db.add(db_plant)
        db.commit()
    else:
        db_plant = db.query(Plant).first()

    leds = db.query(Led).all()
    if len(leds) < 3:
        for i in range(3 - len(leds)):
            default_led = LedCreate(name=f"led_{i + 1}", red=0, green=0, blue=0, brightness=0, state=ALedMode.OFF.value)
            db_led = Led(**default_led.model_dump(), plant_id=db_plant.id)
            db.add(db_led)
        db.commit()

    my_config = db.query(Config).first()
    if not my_config:
        default_config = ConfigCreate(real_time_position="Hanoi", led_mode=LedMode.OFF.value,mode=WateringMode.AUTOMATIC.value,
                                      hash_password=hash_password("1234"))
        db_config = Config(**default_config.model_dump(), plant_id=db_plant.id)
        db.add(db_config)
        db.commit()

    my_watering = db.query(Watering).first()
    if not my_watering:
        my_watering = Watering(watering_threshold=200, watering_duration=5, plant_id=db_plant.id)
        db.add(my_watering)
        db.commit()

    my_water_level = db.query(WaterLevel).first()
    if not my_water_level:
        default_water_level = WaterLevel(water_level=0, plant_id=db_plant.id)
        db.add(default_water_level)
        db.commit()

    my_schedules = db.query(Watering_Schedule).all()
    if len(my_schedules) < 1:
        default_watering_schedule = Watering_Schedule(duration=2, watering_id=my_watering.id)
        db.add(default_watering_schedule)
        db.commit()
        db.refresh(default_watering_schedule)

