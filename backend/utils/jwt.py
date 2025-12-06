"""
Ovozly Backend - JWT Token Utilities

Provides JWT token creation and validation for authentication.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Union

from fastapi import HTTPException, status
from jose import jwt as _jwt
from pydantic import ValidationError

from api.schemas.token import TokenPayload
from core.config import settings


class JWT:
    """
    JWT token management for authentication.

    Handles creation and validation of access tokens using HS256 algorithm.
    """
    ACCESS_TOKEN_EXPIRE_MINUTES = 525960  # 1 year
    ALGORITHM = "HS256"

    @classmethod
    def _create(cls, key: str, expire_minutes: int, subject: Union[str, Any]) -> str:
        expires_delta = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
        to_encode = {"exp": expires_delta, "sub": subject}
        return _jwt.encode(to_encode, key, cls.ALGORITHM)

    @classmethod
    def _decode(cls, token: str, secret_key: str) -> TokenPayload:
        try:
            payload = _jwt.decode(token, secret_key, algorithms=[cls.ALGORITHM])
            token_data = TokenPayload(**payload)

            if datetime.fromtimestamp(token_data.exp) < datetime.now():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expired",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        except (_jwt.JWTError, ValidationError):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return token_data

    @classmethod
    def create_access_token(cls, subject: Union[str, Any]) -> str:
        return cls._create(settings.JWT_KEY, cls.ACCESS_TOKEN_EXPIRE_MINUTES, subject)

    @classmethod
    def decode_access_token(cls, token: str) -> TokenPayload:
        return cls._decode(token, settings.JWT_KEY)


def test() -> None:
    token = JWT.create_access_token("test")
    print("Token:", token)
    res = JWT.decode_access_token(token)
    print("Res:", res)


if __name__ == "__main__":
    test()
