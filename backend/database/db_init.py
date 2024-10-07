from sqlalchemy.orm import Session

from models.models import Plant, Led, Config
from schemas.schemas import PlantCreate, LedCreate, ConfigCreate
from utils import hash_password


# ham khoi tao db
def init_db(db: Session):
    global db_plant
    plant = db.query(Plant).first()
    if not plant:
        default_plant = PlantCreate(name="default", description="default plant")
        db_plant = Plant(**default_plant.model_dump())
        db.add(db_plant)
        db.commit()
    else:
        db_plant = db.query(Plant).first()

    leds = db.query(Led).all()
    if len(leds) < 2:
        for i in range(2 - len(leds)):
            default_led = LedCreate(name=f"led_{i + 1}", red=0, green=0, blue=0, brightness=0, state=0)
            db_led = Led(**default_led.model_dump(), plant_id=db_plant.id)
            db.add(db_led)
        db.commit()

    my_config = db.query(Config).first()
    if not my_config:
        default_config = ConfigCreate(real_time_position="Hanoi", led_mode="off",operation_mode="ADAPTIVE",
                                      hash_password=hash_password("1234"))
        db_config = Config(**default_config.model_dump(), plant_id=db_plant.id)
        db.add(db_config)
        db.commit()
