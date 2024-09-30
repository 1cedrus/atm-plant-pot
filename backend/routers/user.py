from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from models.models import Config, hash_password
from schemas.users_chemas import LoginRequest, ChangePassword
from utils import create_access_token, pin_authenticate

router = APIRouter(prefix="/api")


@router.post("/login/", tags=["login"])
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    config = db.query(Config).first()
    if not config or config.hash_password != hash_password(request.pin):
        raise HTTPException(
            status_code=401,
            detail="Invalid PIN"
        )
    access_token = create_access_token(data={"sub": hash_password(request.pin)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/change-password/", tags=["change password"])
async def change_password(request: ChangePassword, db: Session = Depends(get_db), config: Config = Depends(pin_authenticate)):
    if config.hash_password != hash_password(request.oldPin):
        raise HTTPException(
            status_code=400,
            detail="Wrong PIN"
        )
    config.hash_password = hash_password(request.newPin)
    db.commit()
    return {"message": "Change password successfully"}
