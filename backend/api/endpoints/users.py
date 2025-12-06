"""
Ovozly Backend - User Management API Endpoints

This module provides REST API endpoints for user authentication and management.
Supports JWT-based authentication with role-based access control.
"""

from datetime import datetime
from typing import List, NoReturn, Optional, Union

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from api import schemas
from api.deps import get_db, get_user_optional
from db.models.user import User
from utils.jwt import JWT


router = APIRouter(prefix="/users", tags=["Users"])
pass_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def authorize(db: Session, email: str, password: str) -> Union[schemas.TokenResponse, NoReturn]:
    """
    Authenticate user credentials and generate JWT token.

    Args:
        db: Database session
        email: User email address
        password: Plain text password

    Returns:
        TokenResponse with JWT access token

    Raises:
        HTTPException 401: Invalid credentials
    """
    user = db.query(User).filter(User.email == email).first()

    if not user or not pass_ctx.verify(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = JWT.create_access_token(user.email)
    return schemas.TokenResponse(access_token=token)


@router.post("/authorize-swagger", response_model=schemas.TokenResponse, include_in_schema=False)
async def authorize_swagger(
    auth_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    return authorize(db, auth_data.username, auth_data.password)


@router.post("/authorize", response_model=schemas.TokenResponse)
async def authorize_user(auth_data: schemas.UserAuth, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT access token.

    Args:
        auth_data: Email and password credentials

    Returns:
        JWT access token for authenticated requests
    """
    return authorize(db, auth_data.email, auth_data.password)


@router.post("/", response_model=schemas.User)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    auth_user: Optional[User] = Depends(get_user_optional),
):
    """
    Create a new user account.

    Only admin users can specify the role during creation.
    Default role is 'agent' for self-registration.

    Args:
        user: User creation data (email, password, name, optional role)

    Returns:
        Created User object

    Raises:
        HTTPException 400: Email already registered
        HTTPException 403: Non-admin trying to set role
    """
    if User.exists(db, email=user.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    if (not auth_user or auth_user.role != "admin") and user.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can specify user roles during creation",
        )

    if not user.role:
        user.role = "agent"

    new_user = User(
        email=str(user.email),
        password=pass_ctx.hash(user.password),
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        is_active=True,  # Change to False after implementing email verification
        created_at=datetime.now(),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.get("/", response_model=List[schemas.User])
def list_users(db: Session = Depends(get_db)):
    """
    List all registered users.

    Returns:
        List of User objects
    """
    return db.query(User).all()
