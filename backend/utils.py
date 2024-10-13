from datetime import datetime, timedelta, timezone
import asyncio
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session

from database.database import get_db
from models.models import Config, hash_password



APIKEY = "PJP6LSPND8S8G9XJZ65HZP8KP"

SECRET_KEY = "5f57e01c59634054a8085e3e7486a2f735a6c08d12e88f68b0c7b42cc08e32c8"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 999


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def verify_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        pin: str = payload.get("sub")
        if pin is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception
    return pin

async def pin_authenticate(db: Session = Depends(get_db), pin: str = Depends(verify_token)):
    config = db.query(Config).first()
    if not config or config.hash_password != pin:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )
    return config  # Return config object nếu mã PIN hợp lệ

def get_event_loop():
    try:
        return asyncio.get_running_loop()
    except RuntimeError:
        # Nếu không có event loop nào đang chạy, tạo một cái mới
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop

#Get-Process | Where-Object { $_.ProcessName -like "*python*" }
#taskkill /F /PID <ID>
