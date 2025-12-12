# Checkmate (Project 1)

A Google-style AI Todo List application.

## 🚀 How to Run

### 1. Start the Shared Backend (Recommended)
Checkmate now supports user authentication and persistence via the **Stash Backend**.
```bash
cd ../2-Stash/backend
source venv/bin/activate
uvicorn main:app --reload --port 8001
```
*Note: The local `1-Checkmate/backend` (Port 8000) is deprecated for full features.*

### 2. Start the Frontend
Open a new terminal:
```bash
npm install # Ensure dependencies are installed
npm run dev
```
Frontend will run at `http://localhost:5173` (or `5174` if port is busy).

## ✨ Features
*   **AI Task Parsing**: Type "Buy milk tomorrow" and AI extracts the task and date.
*   **Google Material 3**: Beautiful, modern UI.
*   **Edit Tasks**: Click the pencil icon or the text to edit.
*   **Optimistic UI**: (Implemented via placeholders while loading).

## 🛠 Tech Stack
*   React + Vite
*   Material UI
*   FastAPI + Google GenAI SDK
