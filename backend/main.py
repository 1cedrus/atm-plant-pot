from fastapi import FastAPI, Request
# from starlette.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware

import mqtt
import ws
from database.database import engine, SessionLocal, Base
from database.db_init import init_db
from routers import user, mqtt_router, routers, scheduler_router
from water_scheduler import init_scheduler



app = FastAPI(lifespan=mqtt.lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(mqtt_router.router)
app.include_router(routers.router)
app.include_router(ws.router)
app.include_router(scheduler_router.router)

# Tạo các bảng
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"Hello": "World"}


