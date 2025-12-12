# Stash (Project 2)

A Link Aggregator that uses Gemini to automatically summarize and tag saved URLs.

## 🚀 How to Run

### 1. Start the Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8001
```
API will run at `http://localhost:8001`.

### 2. Start the Frontend
Open a new terminal:
```bash
npm run dev
```
Frontend will run at `http://localhost:5173` (or next available port if Checkmate is running).

## ✨ Features
*   **Gemini URL Context**: Uses `part.from_uri` to read and process external URLs directly.
*   **Auto-Summarization**: Generates concise summaries.
*   **Auto-Tagging**: Extracts relevant tags.
*   **Google Green Theme**: Custom Material UI theme.

## 🛠 Tech Stack
*   React + Vite
*   Material UI
*   FastAPI + Google GenAI SDK
