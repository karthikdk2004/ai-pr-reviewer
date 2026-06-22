# 🔍 AI GitHub PR Reviewer

> An AI-powered code review tool that analyzes GitHub pull requests for **security vulnerabilities**, **code quality issues**, and **performance bottlenecks** using a multi-agent LangGraph pipeline.

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-ai--pr--reviewer-6366f1?style=for-the-badge)](https://ai-pr-reviewer-eta.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Source_Code-181717?style=for-the-badge&logo=github)](https://github.com/karthikdk2004/ai-pr-reviewer)

**[Live Demo](https://ai-pr-reviewer-eta.vercel.app/)** · **[Report Bug](https://github.com/karthikdk2004/ai-pr-reviewer/issues)** · **[Request Feature](https://github.com/karthikdk2004/ai-pr-reviewer/issues)**

</div>

---

## ✨ Demo

<div align="center">

https://github.com/user-attachments/assets/demo.webp

![PR Reviewer Demo](demo.webp)

*Paste any public GitHub PR URL → Watch the AI pipeline analyze it in real-time → Get a comprehensive review*

</div>

---

## 🏗️ Architecture

The application uses a **5-node LangGraph state machine** where each node is a specialized AI agent:

```mermaid
graph LR
    A[📥 Fetch PR] --> B[🛡️ Security Scan]
    B --> C[📋 Code Quality]
    C --> D[⚡ Performance]
    D --> E[📊 Summary]
    
    style A fill:#3b82f6,color:#fff,stroke:#1e40af
    style B fill:#ef4444,color:#fff,stroke:#991b1b
    style C fill:#f59e0b,color:#fff,stroke:#92400e
    style D fill:#f97316,color:#fff,stroke:#9a3412
    style E fill:#6366f1,color:#fff,stroke:#4338ca
```

| Node | Agent Role | What It Does |
|------|-----------|--------------|
| **Fetch PR** | Data Collector | Calls GitHub API → extracts title, diff, file list, metadata |
| **Security Scan** | Security Analyst | Groq LLM → finds hardcoded secrets, SQL injection, XSS, CSRF, auth bypasses |
| **Code Quality** | Code Reviewer | Groq LLM → detects naming issues, high complexity, SOLID violations, duplication |
| **Performance** | Performance Engineer | Groq LLM → identifies N+1 queries, inefficient algorithms, missing caching |
| **Summary** | Decision Maker | Groq LLM → generates verdict (APPROVE / REQUEST_CHANGES / COMMENT), score /10, summary |

---

## 🚀 Features

- **🤖 Multi-Agent AI Pipeline** — 5 specialized LangGraph nodes, not a single monolithic prompt
- **🛡️ Security Analysis** — Detects hardcoded secrets, injection attacks, authentication bypasses
- **📋 Code Quality** — Identifies naming inconsistencies, cyclomatic complexity, SOLID violations
- **⚡ Performance** — Finds N+1 queries, inefficient algorithms, missing memoization
- **📊 Scoring System** — Overall quality score out of 10 with color-coded severity badges
- **🎯 Actionable Suggestions** — Every issue includes a concrete fix recommendation
- **🌙 Premium Dark UI** — Glassmorphism, Framer Motion animations, animated score rings
- **⏳ Real-time Pipeline Visualization** — Watch each agent node process in sequence
- **📜 Review History** — Full CRUD with persistent storage
- **🔄 Graceful Degradation** — Works without backend using built-in demo data
- **📋 Copy to Clipboard** — Export review as formatted markdown

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI Orchestration** | LangGraph | Multi-agent pipeline as a directed acyclic graph |
| **LLM** | Groq · llama-3.3-70b | Ultra-fast inference (~8s per full review) |
| **Backend** | FastAPI + Python | Async API with structured JSON extraction |
| **Frontend** | React 18 + Vite | Component-based SPA |
| **Animations** | Framer Motion | Spring physics, layout animations, AnimatePresence |
| **Styling** | Tailwind CSS | Utility-first with custom glassmorphism system |
| **Icons** | Lucide React | Consistent iconography |
| **HTTP** | httpx (async) | Non-blocking GitHub API calls |
| **Deployment** | Vercel + Render | Frontend CDN + Backend container |

---

## ⚡ Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- [Groq API Key](https://console.groq.com) (free tier available)

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
# Add your GROQ_API_KEY to .env

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

Open [http://localhost:3000](http://localhost:3000) 🚀

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Get from [console.groq.com](https://console.groq.com) |
| `GITHUB_TOKEN` | ❌ Optional | Increases GitHub API rate limit from 60 → 5000 req/hr |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## 🌐 Deployment

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set **Root Directory** to `backend`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.api.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables: `GROQ_API_KEY`, `GITHUB_TOKEN`

### Frontend → Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set **VITE_API_URL** to your Render backend URL
4. Deploy 🚀

---

## 📁 Project Structure

```
pr-reviewer/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── main.py              # FastAPI routes & CORS
│   │   ├── agents/
│   │   │   ├── graph.py             # LangGraph state machine
│   │   │   ├── nodes.py             # 5 agent node implementations
│   │   │   └── prompts.py           # Structured LLM prompts
│   │   └── models/
│   │       └── schemas.py           # Pydantic models
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main app + Settings page
│   │   ├── components/
│   │   │   ├── PRInput.jsx          # Hero + pipeline loader
│   │   │   ├── ReviewDashboard.jsx  # Score ring + metrics
│   │   │   ├── IssueCard.jsx        # Expandable issue cards
│   │   │   ├── SummaryPanel.jsx     # Review summary
│   │   │   ├── ReviewHistory.jsx    # History table
│   │   │   ├── Navbar.jsx           # Top navigation
│   │   │   └── Sidebar.jsx          # Side navigation
│   │   └── index.css                # Custom CSS + glassmorphism
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## ⚠️ Known Limitations

- **Ephemeral Storage** — Review history is stored in a JSON file on the backend. On Render's free tier, data resets on container restart. For persistent storage, integrate a database like Supabase or MongoDB.
- **Rate Limits** — Without a GitHub token, the GitHub API allows only 60 requests/hour. Set `GITHUB_TOKEN` for 5000 req/hr.
- **Diff Size** — Large PRs (100+ files) are truncated to the first 20 files and 40KB of diff content to stay within LLM context limits.

---

## 👨‍💻 Author

**Karthik DK** — [@karthikdk2004](https://github.com/karthikdk2004)

---

<div align="center">

Built with ❤️ using **LangGraph** + **Groq** + **React** + **Framer Motion**

</div>
