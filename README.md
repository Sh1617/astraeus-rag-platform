# Astraeus: Multi-Agent RAG Platform

Astraeus is an AI-powered Multi-Agent Retrieval-Augmented Generation (RAG) Platform designed to process documents, retrieve relevant knowledge, maintain conversational memory, verify responses, and generate context-aware answers using Large Language Models (LLMs).

The platform combines:

- Document Ingestion & Processing
- Semantic Search with Vector Embeddings
- Multi-Agent Orchestration
- Conversational Memory
- Response Verification
- FastAPI Backend
- React + Vite Frontend
- Dockerized Deployment
- Ollama-powered Local LLMs

---

## Architecture

```text
User Query
     │
     ▼
┌──────────────────┐
│ Orchestrator     │
└────────┬─────────┘
         │
 ┌───────┼────────┬──────────┬─────────┐
 ▼       ▼        ▼          ▼         ▼
Memory  Retrieval Research  Tool   Verification
Agent    Agent      Agent    Agent      Agent
 │         │          │        │          │
 └─────────┴──────────┴────────┴──────────┘
                     │
                     ▼
              Final Response
```

---

## Key Features

### Multi-Agent System

#### Retrieval Agent
- Searches vector database
- Finds semantically relevant chunks
- Supplies context to LLM

#### Memory Agent
- Maintains conversation history
- Provides contextual continuity
- Stores session-specific information

#### Research Agent
- Enhances retrieved knowledge
- Performs additional reasoning
- Supports deeper query understanding

#### Tool Agent
- Executes utility operations
- Integrates external functionality
- Handles auxiliary tasks

#### Verification Agent
- Evaluates generated responses
- Checks consistency with retrieved evidence
- Reduces hallucinations

#### Orchestrator Agent
- Coordinates all agents
- Controls execution flow
- Produces final response

---

## Tech Stack

### Backend
- FastAPI
- LangGraph
- LangChain
- Ollama
- ChromaDB
- Redis
- PyPDF
- Docker

### Frontend
- React 19
- TypeScript
- Vite
- React Router

### AI Models
Default configuration:

```python
model="phi3"
```

Supported alternatives:
- Llama 3
- Mistral
- Gemma
- TinyLlama
- DeepSeek
- Qwen

---

## Project Structure

```text
astraeus-rag-platform/
│
├── backend/
│   ├── agents/
│   │   ├── orchestrator/
│   │   ├── retrieval_agent/
│   │   ├── memory_agent/
│   │   ├── research_agent/
│   │   ├── tool_agent/
│   │   └── verification_agent/
│   │
│   ├── app.py
│   ├── rag_pipeline.py
│   ├── embedder.py
│   ├── retriever.py
│   ├── redis_client.py
│   ├── chroma_db/
│   └── uploads/
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config
│
├── docker-compose.yml
└── README.md
```

---

## Workflow

### 1. Document Upload

Users upload PDF documents through the frontend.

```http
POST /upload
```

The system:
1. Extracts text from PDF files
2. Splits content into chunks
3. Generates embeddings
4. Stores vectors in ChromaDB

### 2. Query Processing

```http
POST /query
```

The orchestrator:
1. Retrieves relevant chunks
2. Loads memory context
3. Calls supporting agents
4. Generates answer using Ollama
5. Verifies response
6. Returns final result

### 3. Streaming Responses

```http
POST /stream-query
```

Provides token-by-token streaming responses for a better user experience.

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Sh1617/astraeus-rag-platform.git

cd astraeus-rag-platform
```

### Backend Setup

```bash
python -m venv venv

source venv/bin/activate

pip install -r requirements.txt
```

### Ollama Setup

```bash
ollama pull phi3

ollama serve
```

Alternative models:

```bash
ollama pull llama3
ollama pull mistral
ollama pull gemma
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## Docker Deployment

```bash
docker compose up --build
```

Application URLs:

```text
Frontend : http://localhost:5173
Backend  : http://localhost:8000
```

---

## API Endpoints

### Health Check

```http
GET /
```

Response:

```json
{
  "message": "ASTRAEUS backend running"
}
```

### Upload PDF

```http
POST /upload
```

Example Response:

```json
{
  "filename": "document.pdf",
  "chunks_stored": 42,
  "message": "Document processed successfully"
}
```

### Query Documents

```http
POST /query
```

Example Response:

```json
{
  "answer": "...",
  "retrieved_chunks": [...],
  "verification": "...",
  "tool_result": "..."
}
```

### Stream Query

```http
POST /stream-query
```

Returns streamed responses token-by-token.

---

## Use Cases

- Enterprise Knowledge Assistants
- Research Paper Analysis
- Legal Document Search
- Technical Documentation QA
- Academic Literature Review
- Internal Company Knowledge Bases
- Multi-Agent AI Research Systems
- Intelligent Chatbots

---

## Future Enhancements

- Web Search Agent
- MCP Integration
- Hybrid Search (BM25 + Vector Search)
- Multi-Modal RAG
- Role-Based Access Control
- Agent Monitoring Dashboard
- Cloud Deployment Support
- Fine-Tuned Domain Models

---

## Author

**Shruti**

AI/ML Engineer | Data Science | LLMOps | Multi-Agent Systems

---
