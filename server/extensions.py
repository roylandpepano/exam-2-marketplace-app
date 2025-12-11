from flask_sqlalchemy import SQLAlchemy
import redis
from config import Config

db = SQLAlchemy()

# Redis client for caching and session management
redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)
