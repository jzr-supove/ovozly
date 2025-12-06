import redis
import pickle
from flipcache import FlipCache
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()

rd = redis.Redis()

cache = FlipCache(
    name="my_cache",
    value_type="custom",
    redis_protocol=rd,
    value_encoder=lambda x: pickle.dumps(x),
    value_decoder=lambda x: pickle.loads(x, encoding="utf-8"),
)
