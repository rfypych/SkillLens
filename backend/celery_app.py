from celery import Celery
from config import settings

celery = Celery(
    "skilllens_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=['tasks']
)

celery.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Jakarta',
    enable_utc=True,
)
