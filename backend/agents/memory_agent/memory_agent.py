import json

from redis_client import redis_client


SESSION_ID = "default_session"


def memory_agent(state):

    question = state["question"]

    existing_memory = redis_client.get(SESSION_ID)

    if existing_memory:
        memory = json.loads(existing_memory)
    else:
        memory = []

    memory.append({
        "role": "user",
        "content": question
    })

    redis_client.set(
        SESSION_ID,
        json.dumps(memory)
    )

    state["memory"] = memory

    return state