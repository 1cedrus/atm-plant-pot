from fastapi import FastAPI

import mqtt
import ws
from database.database import engine, SessionLocal, Base
from database.db_init import init_db
from routers import user, mqtt_router, routers

app = FastAPI(lifespan=mqtt.lifespan)
app.include_router(user.router)
app.include_router(mqtt_router.router)
app.include_router(routers.router)
app.include_router(ws.router)

# Tạo các bảng
Base.metadata.create_all(bind=engine)


# init db
def init():
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()


init()


@app.get("/")
def home():
    return {"Hello": "World"}
