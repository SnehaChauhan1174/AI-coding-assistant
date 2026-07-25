# AI Coding Assistant

An AI-powered browser-based coding assistant designed to improve **code generation, debugging, and codebase understanding** while keeping developers actively involved in the development process.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-blue)
![Backend](https://img.shields.io/badge/backend-FastAPI-green)
![AI](https://img.shields.io/badge/AI-Groq%20%2F%20LLaMA-purple)

---


Unlike conventional AI coding assistants that primarily focus on generating code, this project emphasizes **understanding existing code**, **reviewing AI-generated changes**, and **visualizing project structure** through an interactive development environment.

---

## Features

### AI Code Generation
- Context-aware code generation
- Uses the currently opened file as context
- Generates code inside the IDE

### AI Debug Assistant
- Reviews the active file
- Detects potential issues
- Generates minimal code fixes
- Monaco Diff Editor integration
- Keep / Undo proposed changes
- Agent execution logs

### 📊 Code Flow Graph
- Interactive dependency visualization
- AST-based project analysis
- Displays component relationships
- Visualizes project structure using React Flow

### Human-in-the-Loop Workflow
The assistant never modifies code automatically.

Instead it:

- Reviews code
- Suggests fixes
- Shows code differences
- Waits for developer approval

---

# System Pipeline

```text
Developer
      │
      ▼
React + Monaco IDE
      │
      ▼
FastAPI Backend
      │
      ▼
LangGraph Agent Layer
     ├── Review Agent
     └── Fix Agent
      │
      ├────────► Generated Code
      ├────────► Debug Suggestions
      ├────────► Monaco Diff Viewer
      └────────► Code Flow Graph
```

---

# 🏗 Architecture

## Code Generation

```text
Prompt → Current File Context → Generate Agent → Generated Code → Monaco Editor
```

## Debug Workflow

```text
Current File → Review Agent → Issues → Fix Agent → Proposed Diff → Diff Editor → Keep / Undo
```

## Code Flow

```text
Project Folder → Tree-sitter AST → Dependency Extraction → React Flow Graph
```

---

# 🛠 Tech Stack

### Frontend
- React
- JavaScript
- Monaco Editor
- React Flow
- CSS

### Backend
- FastAPI
- Python

### AI
- LangGraph
- LangChain
- Groq API
- Llama 3.3 70B

### Static Analysis
- Tree-sitter
- Abstract Syntax Tree (AST)

---

# Project Structure

```text
AI-Coding-Assistant/

Frontend/
│
├── Components/
│   ├── FileExplorer
│   ├── Tabs
│   ├── RightPanel
│   ├── ChatPanel
│   ├── ToolBar
│   ├── ActivityBar
│   └── CodebaseGraph
│
├── styles/
└── App.jsx


Backend/
│
├── main.py
├── review_agent.py
├── fix_agent.py
├── dependency_graph.py
├── generalized_tree.py
└── utils/
```

---

# Current Functionality

✅ Project Explorer

✅ Multi-file Editor

✅ Monaco Editor Integration

✅ AI Code Generation

✅ AI Code Review

✅ AI Fix Suggestions

✅ Monaco Diff Viewer

✅ Keep / Undo Changes

✅ Agent Execution Logs

✅ Code Flow Graph

---

# Backend APIs

| Endpoint | Description |
|-----------|-------------|
| `/generate` | Generate code |
| `/review` | Review active file |
| `/fix` | Generate code fixes |
| `/files` | Load project files |
| `/file-content` | Fetch file content |
| `/dependencies` | Generate dependency graph |
| `/open-project` | Open and index a project |
| `/code-flow` | Generate code flow graph |

---

# Human-in-the-Loop Philosophy

The assistant is intentionally designed to support—not replace—the developer.

Every AI-generated change follows the workflow:

```text
Review → Suggest → Compare → Developer Decision
```

This ensures developers remain in control while benefiting from AI assistance.

---

# Future Work

### IDE
- Integrated terminal
- Run and build projects inside the IDE

### Debug Panel
- Runtime Error Chain visualization
- Automatic verification after fixes

### Code Flow
- Function-level execution flow
- State update visualization
- Event flow tracking
- Backend API interaction graph

### AI
- Multi-file context reasoning
- Multi-language support
- Richer code explanations
- Guided "Thinking Mode"

---

# 📸 Screenshots

### IDE

> _Add screenshot_

---

### Debug Panel

> _Add screenshot_

---

### Monaco Diff Viewer

> _Add screenshot_

---

### Code Flow Graph

> _Add screenshot_

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/<your-username>/AI-Coding-Assistant.git
```

---

## Backend

```bash
cd Backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

---

## Frontend

```bash
cd Frontend

npm install

npm run dev
```

---

# Environment Variables

Create a `.env` file inside the backend.

```env
GROQ_API_KEY=your_api_key
```

---

# 📈 Project Highlights

- AI-assisted code generation
- AI-powered debugging workflow
- Monaco Diff Editor integration
- LangGraph-based agent architecture
- AST-based project analysis
- Interactive Code Flow Graph
- Human-in-the-loop development workflow

---

# Author

**Sneha Chauhan**

B.Tech AI & ML Student

SPARK Internship – IIT Roorkee

---




---

