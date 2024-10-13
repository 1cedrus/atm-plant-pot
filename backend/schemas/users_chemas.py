from pydantic import BaseModel, constr


class LoginRequest(BaseModel):
    # pin: constr(min_length=4, max_length=4, pattern=r'^\d{4}$')
    pin: constr(min_length=4, max_length=4, pattern=r'^\d{4}$')


class ChangePassword(BaseModel):
    oldPin: constr(min_length=4, max_length=4, pattern=r'^\d{4}$')
    newPin: constr(min_length=4, max_length=4, pattern=r'^\d{4}$')