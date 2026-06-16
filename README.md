# AI Coding Assistant

A browser-based IDE with an integrated AI coding assistant — inspired by Cursor and VS Code. Built from scratch with React, FastAPI, and Groq. The AI panel understands your full codebase context — not just what you type.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-blue)
![Backend](https://img.shields.io/badge/backend-FastAPI-green)
![AI](https://img.shields.io/badge/AI-Groq%20%2F%20LLaMA-purple)

---

## Vision

Most AI chat tools are blind to your project. AI Coding Assistant is being built to truly understand your codebase — file structure, import relationships, open files, selected code, and errors — so it can generate, debug, and explain with full context, not hallucinations.

---

## Features

### Currently Built
- **Monaco Editor** — the exact editor that powers VS Code, with syntax highlighting and line numbers
- **File Explorer** — collapsible file tree with per-folder open/close state
- **AI Chat Panel** — real-time chat with LLaMA 3.3 via Groq API, messages styled by role
- **FastAPI Backend** — clean REST API with CORS, Pydantic validation, and dotenv config
- **Separated Architecture** — React frontend on port 5173, FastAPI backend on port 8000

### In Progress
- File click → opens file content in Monaco editor
- Multi-file tab bar (open, switch, close tabs)
- AI receives currently open file as context with every message
- Activity bar with proper icons (Files, Generate, Debug, Explain)
- Status bar showing language, line number, cursor position

### Planned (Roadmap)
- Backend reads real files from disk
- Full project file tree served via API
- Import graph — which file imports which
- Codebase flowchart (React Flow) built from real import relationships
- RAG (Retrieval Augmented Generation) — index entire project, retrieve only relevant files per query so AI has smart context without hitting token limits
- Generate panel — AI writes code, diff preview before applying to editor
- Debug panel — error chain tracing across files, fix suggestions
- Explain panel — decision cards explaining why code was written a certain way
- Code execution sandbox — run Python code, see output inside IDE
- Streaming AI responses — tokens appear character by character
- Builder Agent loop — generate → execute → fix → retry automatically

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Icons | Lucide React |
| Styling | Custom CSS (VS Code dark theme) |
| Backend | Python, FastAPI, Uvicorn |
| AI Model | LLaMA 3.3 70B via Groq API |
| Config | python-dotenv |

---

## Project Structure

```
AI-Coding-Assistant/
│
├── Frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── FileExplorer.jsx    # collapsible file tree
│   │   │   └── ChatPanel.jsx       # AI chat UI + API calls
│   │   ├── App.jsx                 # main layout (activity bar, panels)
│   │   └── App.css                 # VS Code inspired dark theme
│   ├── index.html
│   └── package.json
│
└── Backend/
    ├── main.py                     # FastAPI app, /chat endpoint, Groq integration
    ├── .env                        # API keys — never committed
    ├── .gitignore
    └── requirements.txt
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Groq API key — free at [console.groq.com](https://console.groq.com)

### Frontend
```bash
cd Frontend
npm install
npm run dev
# runs at http://localhost:5173
```

### Backend
```bash
cd Backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install fastapi uvicorn groq python-dotenv
```

Create `.env` in the `Backend` folder:
```
GROQ_API_KEY=your_api_key_here
```

```bash
uvicorn main:app --reload
# runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

---

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/chat` | Send message, get AI response |

### POST `/chat`
```json
// Request
{ "message": "Write a Python function to reverse a string" }

// Response
{ "response": "Here is a Python function..." }
```

---

## How AI Context Works (Current → Planned)

```
Level 1 (current)  → user message only
Level 2 (next)     → current open file sent with every message
Level 3            → all open files sent
Level 4            → backend reads full project from disk
Level 5            → import graph built from real file relationships
Level 6 (RAG)      → entire project indexed, only relevant files retrieved per query
```

RAG means the AI won't hallucinate about your project — it will retrieve the actual relevant files and send only those as context, staying within token limits while being fully aware of your codebase.

---



---

