import sys
from pathlib import Path

# Ensure the backend directory is in Python path for imports
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from celery import Celery
from celery.signals import worker_process_init
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


@worker_process_init.connect
def init_ml_models(**kwargs):
    # Only preload the local model if using local STT provider
    if settings.STT_PROVIDER == "local":
        from ai.loader import get_model, get_processor
        logger.info("Preloading local Seamless M4T model...")
        get_processor()
        get_model()
        logger.info("Local model loaded successfully")
    else:
        logger.info(f"Using {settings.STT_PROVIDER} STT provider - skipping local model preload")


celery.autodiscover_tasks(["core"])
