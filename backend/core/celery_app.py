from celery import Celery
from celery.signals import worker_process_init

from ai.loader import get_model, get_processor
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
    # Preload the model and processor once per worker
    get_processor()
    get_model()


celery.autodiscover_tasks(["core"])
