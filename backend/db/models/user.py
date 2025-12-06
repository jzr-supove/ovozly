"""
Ovozly Backend - User Database Model

Represents system users (agents and admins) for authentication and authorization.
"""

from datetime import datetime
from typing import Optional, Type

from sqlalchemy import Boolean, Column, DateTime, Integer, String, exists
from sqlalchemy.orm import Session, relationship

from db.base import Base


class User(Base):
    """
    User entity for authentication and authorization.

    Attributes:
        id: Primary key (auto-increment)
        first_name: User's first name
        last_name: User's last name
        email: Unique email address (indexed)
        password: Bcrypt-hashed password
        role: User role ('admin' or 'agent')
        is_active: Account activation status
        created_at: Timestamp of record creation
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="agent")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)

    calls = relationship("Call", back_populates="user")

    @classmethod
    def get(cls: Type["User"], db: Session, email: str) -> Optional["User"]:
        """Retrieve a user by email address."""
        return db.query(cls).filter(cls.email == email).first()

    @classmethod
    def exists(cls: Type["User"], db: Session, email: str) -> bool:
        """Check if a user with the given email exists."""
        return db.query(exists().where(cls.email == email)).scalar()
