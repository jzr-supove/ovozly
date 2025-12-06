from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import settings


# Create the database engine
engine = create_engine(settings.DATABASE_URL)

# Session local for database interactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
