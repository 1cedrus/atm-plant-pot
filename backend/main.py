from fastapi import FastAPI

import mqtt
from database import engine, SessionLocal, Base
from db_init import init_db
from routers import user

app = FastAPI(lifespan=mqtt.lifespan)
app.include_router(user.router)
app.include_router(mqtt.router)

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
