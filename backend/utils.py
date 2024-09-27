import hashlib
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext

SECRET_KEY = "5f57e01c59634054a8085e3e7486a2f735a6c08d12e88f68b0c7b42cc08e32c8"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=30)
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


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_md5(input_string: str) -> str:
    # Mã hóa chuỗi đầu vào thành bytes
    input_bytes = input_string.encode('utf-8')
    # Tạo đối tượng hash MD5
    md5_hash = hashlib.md5(input_bytes)
    # Trả về giá trị hash dưới dạng chuỗi hex
    return md5_hash.hexdigest()


def hash_password(password: str) -> str:
    return hash_md5(password)
