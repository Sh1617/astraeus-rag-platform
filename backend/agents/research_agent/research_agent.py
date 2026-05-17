from rag_pipeline import generate_answer


def research_agent(state):

    question = state["question"]

    retrieved_chunks = state["retrieved_chunks"]

    answer = generate_answer(
        query=question,
        context_chunks=retrieved_chunks
    )

    state["answer"] = answer

    return state