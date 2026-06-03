# AI Coding Assistant

A browser-based IDE with an integrated AI coding assistant — built from scratch with React, FastAPI, and Groq.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-blue)
![Backend](https://img.shields.io/badge/backend-FastAPI-green)
![AI](https://img.shields.io/badge/AI-Groq%20%2F%20LLaMA-purple)

---

## What is this?

AI Coding Assistant is a VS Code-inspired IDE that runs in the browser. It combines a full-featured code editor with an AI chat panel that understands your codebase — so you can generate, debug, and explain code without leaving your editor.

---

## Features (Current)

- **Monaco Editor** — the same editor that powers VS Code, with syntax highlighting and line numbers
- **File Explorer** — collapsible file tree with folder toggle
- **AI Chat Panel** — chat with an LLM (Groq / LLaMA) directly inside the IDE
- **Separated Frontend & Backend** — React frontend, FastAPI backend, clean API boundary

## Features (In Progress)

- File click → open in Monaco editor
- Multi-file tabs
- AI context awareness — AI sees the currently open file
- Activity bar with icons
- Status bar
- RAG-based full project context for AI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Monaco Editor |
| Styling | CSS (custom, VS Code-inspired dark theme) |
| Backend | Python, FastAPI, Uvicorn |
| AI | Groq API (LLaMA 3.3 70B) |
| Icons | Lucide React |

---

## Project Structure

```
AI-Coding-Assistant/
│
├── Frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── FileExplorer.jsx
│   │   │   └── ChatPanel.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   ├── index.html
│   └── package.json
│
└── Backend/
    ├── main.py
    ├── .env          ← not committed
    ├── .gitignore
    └── requirements.txt
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Groq API key — get one free at [console.groq.com](https://console.groq.com)

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`

### Backend Setup

```bash
cd Backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install fastapi uvicorn groq python-dotenv
```

Create a `.env` file in the `Backend` folder:
```
GROQ_API_KEY=your_api_key_here
```

Start the server:
```bash
uvicorn main:app --reload
```

Runs at `http://localhost:8000`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/chat` | Send message, get AI response |

### POST `/chat` — Request Body
```json
{
  "message": "Write a Python function to reverse a string"
}
```

### POST `/chat` — Response
```json
{
  "response": "Here's a Python function..."
}
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |

Never commit your `.env` file. It is already in `.gitignore`.

---

## Roadmap

- [ ] File click opens file in Monaco
- [ ] Multi-file tab system
- [ ] AI receives current file as context
- [ ] Activity bar with icons
- [ ] Status bar (language, line number)
- [ ] Backend reads real files from disk
- [ ] Full project context (RAG)
- [ ] Import graph and codebase flowchart
- [ ] Code execution sandbox
- [ ] Streaming AI responses

---

## Contributing

This project is currently being built as a learning project. Feel free to open issues or suggestions.

---

## License

MIT
