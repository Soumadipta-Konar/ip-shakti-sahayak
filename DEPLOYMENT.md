# IP-SAKTI Sahayak - Production Deployment Guide
**Frontend: Vercel (Free Tier) | Backend: Render (Free Tier)**

This guide walks you through deploying the complete IP-SAKTI Sahayak platform with zero hosting costs using the free tiers of **Render** (for the FastAPI backend) and **Vercel** (for the Next.js `frontend-modern`).

---

## Architecture Overview

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│       Vercel (Free Tier)        │           │       Render (Free Tier)        │
│                                 │           │                                 │
│  frontend-modern (Next.js 14)   │  HTTPS    │   backend (FastAPI + LangGraph) │
│  - Modern Glassmorphic UI       │──────────>│   - Multi-Agent Statutory RAG   │
│  - Triage Formulation Wizard   │  /api/v1  │   - Groq LLM (gpt-oss-120b)     │
│  - TKDL Prior Art Analyzer      │           │   - FastEmbed (BAAI/bge-small)  │
│  - Statutory Dossier Generator  │           │   - Qdrant Cloud Vector Library │
└─────────────────────────────────┘           └─────────────────────────────────┘
```

---

## Phase 1: Deploy Backend on Render (Free Tier)

Render provides a generous free tier for Python web services (512 MB RAM, free HTTPS, and automatic Git deployments).

### Option A: 1-Click Deployment via `render.yaml` (Recommended)

1. Push your repository to **GitHub**.
2. Go to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top right and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and configure:
   - **Service Name**: `ip-sakti-sahayak-backend`
   - **Runtime**: Python
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`
   - **Health Check Path**: `/health`
6. When prompted for environment secrets, enter your API keys:
   - `GROQ_API_KEY`: Your Groq API key (`gsk_...`)
   - `QDRANT_URL` *(Optional)*: Your Qdrant Cloud URL (`https://xxxx.cloud.qdrant.io:6333`)
   - `QDRANT_API_KEY` *(Optional)*: Your Qdrant Cloud API key
7. Click **Apply**. Render will build and deploy your backend.

---

### Option B: Manual Web Service Setup on Render

If you prefer configuring the Web Service manually:

1. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Web Service**.
2. Select your repository.
3. Configure the following fields:
   | Setting | Value | Notes |
   |---|---|---|
   | **Name** | `ip-sakti-sahayak-backend` | Or any unique name |
   | **Region** | Oregon (US West) or Frankfurt | Pick whichever is closest |
   | **Branch** | `main` | Your primary branch |
   | **Root Directory** | `backend` | **Important:** Point to `backend` folder |
   | **Runtime** | `Python 3` | |
   | **Build Command** | `pip install -r requirements.txt` | Installs lightweight production deps |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1` | Binds to dynamic `$PORT` |
   | **Instance Type** | `Free` | 512 MB RAM, 0.1 CPU |

4. Expand **Advanced** and set **Health Check Path** to:
   ```
   /health
   ```

5. Under **Environment Variables**, add:
   | Key | Value | Purpose |
   |---|---|---|
   | `PYTHON_VERSION` | `3.10.14` | Matches tested runtime |
   | `ENVIRONMENT` | `production` | Production mode |
   | `CORS_ORIGINS` | `*` | Allows Vercel frontend |
   | `GROQ_API_KEY` | `your-groq-api-key` | LLM generation |
   | `GROQ_MODEL` | `openai/gpt-oss-120b` | Primary legal LLM |
   | `GROQ_FAST_MODEL` | `qwen/qwen3.8-27b` | High-speed fallback |
   | `EMBEDDING_MODEL_NAME` | `BAAI/bge-small-en-v1.5` | 384-d semantic model |
   | `EMBEDDING_DIMENSION` | `384` | Vector dimension |
   | `QDRANT_COLLECTION_NAME`| `legal_chunks` | Collection name |
   | `QDRANT_URL` | *(Optional)* `https://...` | Qdrant Cloud URL |
   | `QDRANT_API_KEY` | *(Optional)* `...` | Qdrant Cloud API key |

6. Click **Create Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://ip-sakti-sahayak-backend.onrender.com`).
8. Verify it by visiting:
   ```
   https://ip-sakti-sahayak-backend.onrender.com/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "service": "IP-SAKTI Sahayak",
     "version": "1.0.0",
     "environment": "production",
     "database_health": {
       "qdrant": "connected (Statutory Legal Library Active)",
       "groq": "available",
       "embedding_model": "BAAI/bge-small-en-v1.5"
     }
   }
   ```

---

## Phase 2: Deploy Frontend (`frontend-modern`) on Vercel (Free Tier)

Vercel provides free global CDN hosting, automated SSL, and preview environments for Next.js applications.

### Step-by-Step Vercel Setup

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** → **Project**.
2. Select your GitHub repository.
3. In the **Configure Project** screen:
   - **Project Name**: `ip-sakti-sahayak` (or your choice)
   - **Framework Preset**: `Next.js` (auto-detected)
   - **Root Directory**: Click **Edit** and choose:
     ```
     frontend-modern
     ```
     *(This is critical because your repo is a monorepo containing both `backend` and `frontend-modern`).*
4. Expand **Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend-name.onrender.com/api/v1` |

   > **Important:**
   > - Use your actual Render backend URL copied from Phase 1.
   > - Make sure the URL starts with `https://` (not `http://`) to avoid browser Mixed Content errors.
   > - You can include or omit `/api/v1`; `frontend-modern` automatically normalizes it.

5. Click **Deploy**.
6. Vercel will run `npm run build` and output your live production URL (e.g., `https://ip-sakti-sahayak.vercel.app`).

---

## Free-Tier Operational Characteristics

### Render Free Tier Cold Starts
- **Behavior**: Render free instances spin down after 15 minutes of inactivity to save resources.
- **Spin-up time**: When you make the first request after spin-down, Render takes **~30 to 50 seconds** to wake up the service.
- **Frontend Safeguards**:
  1. `frontend-modern` automatically initiates a background `/health` ping on initial page load to begin waking up the Render backend before the user types their first prompt.
  2. If the backend is waking up, `ChatContainer` and the statutory tools handle timeout and connection gracefully, displaying local statutory fallbacks if needed.
- **Tip (Optional Uptime Ping)**: You can keep your Render free instance awake during working hours by setting up a free monitor (e.g., [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org)) that pings `https://your-backend.onrender.com/health` every 10 minutes.

### 512 MB RAM Optimization
- The backend has been optimized with `fastembed` (an ONNX-runtime embedding library that uses only ~40 MB RAM instead of PyTorch's 500 MB+).
- The web server runs with `--workers 1` to prevent memory duplication on free tier.
- Heavy offline ingestion libraries (`unstructured`, `pdfplumber`, `PyMuPDF`) are decoupled into `requirements-etl.txt` so production runtime remains slim.

---

## Verification Checklist

| Test Item | Endpoint / Action | Expected Result |
|---|---|---|
| **Backend Health** | `GET https://your-backend.onrender.com/health` | HTTP 200 with JSON `{ status: "ok" }` |
| **CORS Verification** | `OPTIONS https://your-backend.onrender.com/api/v1/ask` | Allowed for `*.vercel.app` & `*` |
| **Classification API** | `POST https://your-backend.onrender.com/api/v1/classify` | HTTP 200 with statutory category |
| **Prior Art API** | `POST https://your-backend.onrender.com/api/v1/prior-art/analyze` | HTTP 200 with Section 3(p) analysis |
| **Dossier API** | `POST https://your-backend.onrender.com/api/v1/dossier/generate` | HTTP 200 with SHA-256 hash |
| **Frontend Live** | Open your Vercel URL | Next.js landing page renders with zero console errors |
| **Chat Interaction** | Ask *"Can I patent a formulation of Turmeric and Neem?"* | Assistant returns structured statutory evaluation with citations |
