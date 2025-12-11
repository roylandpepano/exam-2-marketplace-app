from extensions import redis_client
import json
from functools import wraps
from flask import request


def cache_key(*args, **kwargs):
    """Generate cache key from arguments."""
    key_parts = [str(arg) for arg in args]
    key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
    return ':'.join(key_parts)


def get_cache(key):
    """Get value from Redis cache."""
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
    except Exception as e:
        print(f"Cache get error: {e}")
    return None


def set_cache(key, value, ttl=300):
    """Set value in Redis cache with TTL in seconds."""
    try:
        redis_client.setex(key, ttl, json.dumps(value))
    except Exception as e:
        print(f"Cache set error: {e}")


def delete_cache(pattern):
    """Delete cache keys matching pattern."""
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
    except Exception as e:
        print(f"Cache delete error: {e}")


def cached(prefix, ttl=300):
    """Decorator to cache function results."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            key = cache_key(prefix, request.full_path if request else '')
            
            # Try to get from cache
            cached_value = get_cache(key)
            if cached_value is not None:
                return cached_value
            
            # Execute function and cache result
            result = f(*args, **kwargs)
            set_cache(key, result, ttl)
            return result
        
        return wrapper
    return decorator


def invalidate_cache(prefix):
    """Invalidate all cache entries with given prefix."""
    delete_cache(f"{prefix}:*")
