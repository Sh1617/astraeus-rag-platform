from embedder import generate_embedding
from retriever import search_chunks


def retrieval_agent(state):

    question = state["question"]

    query_embedding = generate_embedding(question)

    relevant_chunks = search_chunks(query_embedding)

    state["retrieved_chunks"] = relevant_chunks

    return state