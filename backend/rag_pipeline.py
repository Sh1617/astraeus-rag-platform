from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import ollama


def extract_text_from_pdf(file_path):

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:

        extracted = page.extract_text()

        if extracted:
            text += extracted

    return text


def chunk_text(text):

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    chunks = text_splitter.split_text(text)

    return chunks




def generate_answer(query, context_chunks):

    if not context_chunks:
        return "No relevant context found."

    context = "\n\n".join(context_chunks)

    prompt = f"""
    Answer the question using only the context below.

    Context:
    {context}

    Question:
    {query}
    """

    stream = ollama.chat(
        model="llama3",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        stream=True
    )

    final_response = ""

    for chunk in stream:

        content = chunk["message"]["content"]

        final_response += content

        print(content, end="", flush=True)

    return final_response