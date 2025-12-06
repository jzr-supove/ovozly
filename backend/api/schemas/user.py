from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr

# from db.models.call import Call


__all__ = ["User", "UserCreate", "UserAuth", "UserUpdate", "UserList"]


def to_lower(field: str) -> str:
    return field.lower()


def to_camel_case(field: str) -> str:
    return "".join(word.capitalize() if i > 0 else word for i, word in enumerate(field.split("_")))


class User(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    # calls: List['Call'] = []

    class Config:
        # arbitrary_types_allowed = True
        from_attributes = True


class UserCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = ""
    email: EmailStr
    role: Optional[str] = None
    password: str

    class Config:
        populate_by_name = True
        alias_generator = to_camel_case


class UserAuth(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

    class Config:
        populate_by_name = True
        alias_generator = to_camel_case


# Remove this nigga later
class UserList(BaseModel):
    users: List[User]
