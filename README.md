# AI GitHub PR Reviewer

A production-grade AI-powered GitHub PR reviewer built with LangGraph, Groq (llama-3.3-70b-versatile), FastAPI, and React.

## Features

- **5-node LangGraph pipeline**: fetch → security → quality → performance → summary
- **Security analysis**: hardcoded secrets, SQL injection, XSS, CSRF, auth bypasses
- **Code quality**: naming, complexity, duplication, SOLID violations
- **Performance**: N+1 queries, inefficient algorithms, missing caching
- **Verdict**: APPROVE / REQUEST\_CHANGES / COMMENT with a score /10
- **Dark theme UI** with animated pipeline visualization
- **Review history** with full CRUD
- **Mock data fallback** — works without a running backend

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
# Edit .env with your keys

uvicorn app.api.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_URL=http://localhost:8000

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Get from [console.groq.com](https://console.groq.com) |
| `GITHUB_TOKEN` | No | Increases GitHub API rate limit from 60 to 5000 req/hr |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

## Deployment

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set **Root Directory** to `backend`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.api.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables: `GROQ_API_KEY`, `GITHUB_TOKEN`

### Frontend → Vercel

```bash
cd frontend
npm i -g vercel
vercel --prod
# Set VITE_API_URL to your Render backend URL
```

## Architecture

```
PR URL
  │
  ▼
┌─────────────┐
│  fetch_node │  GitHub API → PR title, diff, files
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  security_node  │  Groq LLM → security vulnerabilities
└────────┬────────┘
         │
         ▼
┌───────────────┐
│  quality_node │  Groq LLM → code quality issues
└───────┬───────┘
        │
        ▼
┌──────────────────────┐
│  performance_node    │  Groq LLM → performance issues
└──────────┬───────────┘
           │
           ▼
┌───────────────┐
│  summary_node │  Groq LLM → verdict + score + summary
└───────────────┘
```

## Tech Stack

| Layer | Tech |
|---|---|
| AI Orchestration | LangGraph |
| LLM | Groq · llama-3.3-70b-versatile |
| Backend | FastAPI + Python |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| GitHub API | httpx (async) |
