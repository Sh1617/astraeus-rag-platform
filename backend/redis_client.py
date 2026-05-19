import redis

try:
    redis_client = redis.Redis(
        host="localhost",
        port=6379,
        decode_responses=True,
        socket_connect_timeout=2
    )

    redis_client.ping()

    print("Redis connected")

except Exception as e:

    print("Redis unavailable:", e)

    redis_client = None