from fastapi import FastAPI

# from . import models
from database import engine, SessionLocal, Base
from db_init import init_db
from routers import user

app = FastAPI()

app.include_router(user.router)

# Tạo các bảng
# models.Base.metadata.create_all(bind=engine)
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
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
