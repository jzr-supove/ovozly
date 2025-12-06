"""
Ovozly Backend - Dependency Injection

Provides FastAPI dependency injection functions for database sessions,
authentication, and authorization.
"""

from contextlib import contextmanager
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from db.models.user import User
from db.session import SessionLocal
from utils.jwt import JWT


reusable_oauth = OAuth2PasswordBearer(
    tokenUrl="users/authorize-swagger", scheme_name="JWT", auto_error=False
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_x():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class InvalidTokenException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


class NotAuthenticatedException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )


class NotAdminException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins have rights to this endpoint",
        )


async def authenticate_user(
    token: Optional[str], db: Session, required: bool = True
) -> Optional[User]:
    if not token:
        if required:
            raise NotAuthenticatedException
        return None

    token_data = JWT.decode_access_token(token)
    user = User.get(db, email=token_data.sub)

    if user is None:
        raise InvalidTokenException

    return user


async def get_user(
    token: Optional[str] = Depends(reusable_oauth), db: Session = Depends(get_db)
) -> User:
    return await authenticate_user(token, db)


async def get_user_optional(
    token: Optional[str] = Depends(reusable_oauth), db: Session = Depends(get_db)
) -> Optional[User]:
    return await authenticate_user(token, db, required=False)


async def admin_only(
    token: Optional[str] = Depends(reusable_oauth), db: Session = Depends(get_db)
) -> bool:
    user = await authenticate_user(token, db)

    if user.role != "admin":
        raise NotAdminException

    return True
