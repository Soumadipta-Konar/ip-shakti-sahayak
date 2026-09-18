# IP-SHAKTI Backend (Stage 2 Completed)

Welcome to the IP-SHAKTI backend repository! This is the central intelligence hub for our IP Sahayak.

## 🚀 Features Currently Implemented

* **Cloud Vector DB Integration:** Connected to **Qdrant Cloud** for scalable, cross-machine RAG context retrieval.
* **LangGraph Agent:** Uses **Groq's LLaMA-3** to retrieve legal context and generate highly accurate answers.
* **Advanced Platform Capabilities:**
  * `POST /ask`: Chat with the IP expert.
  * `POST /transcribe`: Upload `.mp3`/audio files for Voice-to-Text via Groq Whisper.
  * `POST /ocr`: Extract text from physical document images via Tesseract.
  * `POST /export-pdf`: Generate a polished PDF report of the AI's legal advice.

## 🛠️ How to run locally

### 1. Set up your `.env`
Make sure you have your `.env` file inside the `backend/` folder. Ask for the keys if you don't have them:
```env
GROQ_API_KEY="your_groq_key"
QDRANT_URL="your_qdrant_url"
QDRANT_API_KEY="your_qdrant_key"
```

### 2. Populate the Database (For Data Team)
Run the ETL pipeline once to push all the PDFs from `data/` to Qdrant Cloud.
```bash
python backend/app/services/etl/etl_ingestion_pipeline.py
```

### 3. Start the API Server
Start the development server:
```bash
cd backend
python -m uvicorn app.main:app --reload
```
Once it says "Application startup complete", open **http://127.0.0.1:8000/docs** in your browser. This will open the **Swagger UI** where you can test all the endpoints manually without needing a frontend!
