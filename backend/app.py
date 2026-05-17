from fastapi import FastAPI, UploadFile, File
import shutil
import os
import uuid

from retriever import search_chunks
from rag_pipeline import generate_answer


from rag_pipeline import extract_text_from_pdf, chunk_text
from embedder import generate_embedding
from retriever import store_chunk


app = FastAPI()

UPLOAD_DIR = "uploads"


os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "ASTRAEUS backend running"
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    text = extract_text_from_pdf(file_path)

    # Chunk text
    chunks = chunk_text(text)

    # Store chunks
    for chunk in chunks:

        embedding = generate_embedding(chunk)

        chunk_id = str(uuid.uuid4())

        store_chunk(
            chunk_id=chunk_id,
            chunk_text=chunk,
            embedding=embedding
        )

    return {
        "filename": file.filename,
        "chunks_stored": len(chunks),
        "message": "Document processed successfully"
    }

@app.post("/query")
async def query_documents(question: str):

    query_embedding = generate_embedding(question)

    relevant_chunks = search_chunks(query_embedding)

    answer = generate_answer(
        query=question,
        context_chunks=relevant_chunks
    )

    return {
        "question": question,
        "answer": answer,
        "retrieved_chunks": relevant_chunks
    }