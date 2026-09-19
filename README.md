# 🌿 IP-SHAKTI Sahayak

Welcome to the **IP-SHAKTI Sahayak** repository! This project serves as a highly specialized, AI-powered Retrieval-Augmented Generation (RAG) platform tailored for Indian statutory law, legal treatises, and pharmacopoeial texts in Ayurveda. It leverages cutting-edge NLP, Knowledge Graphs, and Vector Databases to provide expert-level IP advice, document ingestion, and compliance tracking.

---

## 📚 Table of Contents
1. [About the Project](#about-the-project)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Key Features](#key-features)
5. [Getting Started (Local Development)](#getting-started-local-development)
6. [Data Ingestion Pipeline](#data-ingestion-pipeline)
7. [Contribution Guidelines](#contribution-guidelines)
8. [License & Security](#license--security)

---

## 🎯 About the Project

Standard RAG pipelines often fail in the legal domain due to the loss of hierarchical context and cross-lingual terminologies (e.g., Sanskrit herb names in English Acts). **IP-SHAKTI** solves this through a **Triple-Index Strategy**:
1. **Dense Semantic Vectors (Qdrant):** Capturing conceptual meaning.
2. **Sparse Keyword Index (BM25):** For exact-match retrieval of legal identifiers and Latin botanical names.
3. **Relational Knowledge Graph (Neo4j):** Structurally mapping how different acts cite each other (e.g., Biological Diversity Act interacting with the Patents Act).

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js 14, React 18
* **Styling & UI:** Tailwind CSS, Framer Motion, `clsx`, `tailwind-merge`
* **State Management:** Zustand, React Query (@tanstack/react-query)
* **Icons:** Lucide React

### Backend
* **Framework:** FastAPI, Uvicorn, Pydantic
* **AI & Orchestration:** LangChain, LangGraph, Langfuse, Ragas
* **LLM & Inference:** Groq's LLaMA-3 (`langchain-groq`), Sentence-Transformers
* **Document Processing:** PDFPlumber, Unstructured, PyTesseract (OCR)
* **Security & Compliance:** Presidio (Analyzer/Anonymizer for DPDP compliance)
* **Task Queues:** Celery

### Infrastructure & Databases
* **Containerization:** Docker & Docker Compose
* **Vector DB:** Qdrant
* **Knowledge Graph:** Neo4j
* **Cache & Broker:** Redis
* **Relational DB:** PostgreSQL

---

## 📂 Repository Structure

Here is an overview of what does what:

```text
IP-SHAKTI/
├── backend/                  # FastAPI Application
│   ├── app/                  # Main API source code (endpoints, models, agents)
│   ├── scripts/              # Helper scripts
│   ├── tests/                # Pytest unit & integration tests
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Example environment variables
├── frontend/                 # Next.js Web Application
│   ├── src/                  # React components, pages, hooks, and stores
│   ├── package.json          # Node.js dependencies
│   └── tailwind.config.js    # Tailwind configuration
├── docs/                     # Comprehensive Documentation
│   ├── INGESTION_PIPELINE_ARCHITECTURE.md # ETL & Graph Engine deep-dive
│   └── Formulation_Guideline.md           # Domain specific formulation rules
├── corpus/                   # Raw legal PDFs & Treaties (Not versioned if large)
├── corpus_extracted/         # Processed data
├── docker-compose.yml        # Orchestrates Qdrant, Neo4j, Redis, and Postgres
├── DEVELOPERS_DIARY.md       # Architectural decisions and security logs
└── README.md                 # Project overview and setup (this file)
```

### 🧩 Core Modules & Scripts Breakdown

Here is a detailed look at what individual functions and scripts do in the `backend`:

* **`app/main.py`**: The entry point for the FastAPI application. Initializes the server and connects all routers.
* **`app/api/routes.py`**: Defines all the REST endpoints.
  * `/ask`: Chat endpoint that routes queries through the DPDP security engine and into the LangGraph RAG agent.
  * `/classify`: Evaluates a formula and classifies it using the `FormulationEngine`.
  * `/transcribe`: Processes audio uploads using Groq's Whisper model.
  * `/ocr`: Extracts text from images via PyTesseract.
  * `/export-pdf`: Generates downloadable PDF reports of the generated legal advice.
* **`app/services/agent.py`**: The brain of the operation. Uses **LangGraph** to decompose user queries, retrieve context from Qdrant (dense vectors) and Neo4j (graph relations), applies Reciprocal Rank Fusion (RRF), and generates the final answer with Groq's LLaMA-3.
* **`app/services/guardrails.py`**: Ensures the LLM doesn't hallucinate or wander off-topic. Validates if the answer is faithful to the legal context and strictly IP-related.
* **`app/services/classification_engine.py`**: Contains the logic (`FormulationEngine`) to classify Ayurvedic products/formulas.
* **`app/core/security.py`**: Implements the `DPDPComplianceEngine` to strip out PII (Personally Identifiable Information) before queries reach the LLM.
* **`scripts/ingest_docs.py` & `generate_corpus_index.py`**: ETL (Extract, Transform, Load) scripts that parse raw PDFs, handle chunking, inject metadata, and push the processed vectors/graphs to Qdrant and Neo4j.


---

## ✨ Key Features

1. **Advanced Graph-Augmented RAG:** Uses LangGraph and Groq LLaMA-3 alongside Qdrant & Neo4j for highly accurate legal context retrieval.
2. **Multi-Modal Endpoints:**
   * `/ask`: Chat with the IP expert.
   * `/transcribe`: Voice-to-Text via Groq Whisper for audio queries.
   * `/ocr`: Tesseract-based OCR for physical document images.
   * `/export-pdf`: Generates polished PDF reports of AI legal advice.
3. **Cross-Lingual Support:** Ingests and processes Hindi and Sanskrit texts into canonical English using tools like IndicTrans2/Bhashini.
4. **Security-First (DPDP Compliant):** Integrated SAST tooling (Bandit) and PII masking via Presidio before texts hit the LLM.

---

## 🚀 Getting Started (Local Development)

Follow these steps to spin up the entire IP-SHAKTI stack on your local machine.

### Prerequisites
* Docker & Docker Compose
* Node.js 20+ & npm
* Python 3.10+
* Groq API Key

### 1. Start the Infrastructure (Databases)
We use Docker Compose to run Qdrant, Neo4j, Redis, and PostgreSQL.
```bash
docker-compose up -d
```
*Wait for all containers to reach a healthy state.*

### 2. Backend Setup
Navigate to the `backend` folder and set up a virtual environment.
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Environment Variables:**
Create a `.env` file in the `backend/` directory based on `.env.example`:
```env
GROQ_API_KEY="your_groq_key"
QDRANT_URL="http://localhost:6333"
# Neo4j & Postgres credentials (match what is in docker-compose.yml)
```

**Start the FastAPI Server:**
```bash
python -m uvicorn app.main:app --reload
```
API Documentation (Swagger UI) will be available at: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
Open a new terminal and navigate to the `frontend` folder.
```bash
cd frontend
npm install
```

**Start the Next.js Dev Server:**
```bash
npm run dev
```
The web application will be accessible at: `http://localhost:3000`

---

## 🗄️ Data Ingestion Pipeline (For Data Team)

To populate the Vector and Graph databases with the latest IP and legal corpus, run the ETL pipeline script. This processes PDFs, chunks them semantically, and builds the Neo4j relational edges.

```bash
cd backend
python app/services/etl/etl_ingestion_pipeline.py
```
*For deep architecture details on this process, read `docs/INGESTION_PIPELINE_ARCHITECTURE.md`.*

---

## 🤝 Contribution Guidelines

We welcome contributions from developers, ML engineers, and legal subject-matter experts! Here’s how you can contribute:

1. **Branching Strategy:**
   * Create a branch off `main` for your feature or fix (e.g., `feature/awesome-new-agent` or `fix/ocr-bug`).
2. **Backend Standards:**
   * Code must pass all tests (`pytest`).
   * Maintain modularity (keep endpoints in `app/api`, agents in `app/services`).
   * Keep security in mind (Bandit runs on CI to catch injection flaws).
3. **Frontend Standards:**
   * Use Next.js App Router conventions (if applicable) and Tailwind for styling.
   * Ensure components are reusable and placed under `src/components`.
   * Run `npm run lint` before committing.
4. **Commit & Pull Requests:**
   * Write descriptive commit messages.
   * Open a Pull Request and request a review from a core maintainer.
   * Refer to `DEVELOPERS_DIARY.md` to understand architectural precedents before suggesting massive refactors.

---

*For further queries, please reach out to the core engineering team.*
