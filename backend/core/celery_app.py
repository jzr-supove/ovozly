import sys
from pathlib import Path

# Ensure the backend directory is in Python path for imports
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from celery import Celery
from loguru import logger

from core.config import settings

# Import necessary models here, so autodiscover catches them
import utils  # noqa: F401
import db  # noqa: F401


# Define Celery app and configure it
celery = Celery(
    "tasks",
    broker=settings.REDIS_URL,  # Redis URL
    backend=settings.REDIS_URL,  # Redis backend for results
)

celery.conf.update(
    task_serializer="pickle",
    result_serializer="pickle",
    accept_content=["json", "pickle"],  # Accept both JSON and pickle
    broker_connection_retry_on_startup=True,
    result_expires=None,  # Never expire results
)


celery.autodiscover_tasks(["core"])
