import json

from redis_client import redis_client


def memory_agent(state):

    question = state["question"]

    session_id = state["session_id"]

    # If Redis unavailable
    if redis_client is None:

        print("Redis unavailable - skipping memory")

        state["memory"] = []

        return state

    try:

        existing_memory = redis_client.get(session_id)

        if existing_memory:
            memory = json.loads(existing_memory)
        else:
            memory = []

        memory.append({
            "role": "user",
            "content": question
        })

        redis_client.set(
            session_id,
            json.dumps(memory)
        )

        state["memory"] = memory

    except Exception as e:

        print("Memory agent error:", e)

        state["memory"] = []

    return state