import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection("astraeus")


def store_document(doc_id, text, embedding):

    collection.add(
        ids=[doc_id],
        documents=[text],
        embeddings=[embedding]
    )



def search_documents(query_embedding, top_k=5):

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results