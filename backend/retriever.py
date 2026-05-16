import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection("astraeus")


def store_chunk(chunk_id, chunk_text, embedding):

    collection.add(
        ids=[chunk_id],
        documents=[chunk_text],
        embeddings=[embedding]
    )


def search_chunks(query_embedding, top_k=5):

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results