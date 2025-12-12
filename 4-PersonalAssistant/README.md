# Project 4: Vibe Assistant 🤖

A Google ADK-powered AI agent that integrates with the Vibe One ecosystem.

## Features
*   **Create Tasks**: "Remind me to call John tomorrow" -> Adds to Checkmate.
*   **Save Links**: "Save https://google.com" -> Adds to Stash.
*   **Chat Interface**: Real-time chat with `gemini-2.5-flash`.

## Setup

### 1. Prerequisites
*   **Shared Backend (Project 2)** must be running on Port `8001`.
*   **Google ADC**: Ensure you have run `gcloud auth application-default login`.

### 2. Backend (Port 8002)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

### 3. Frontend (Port 5176)
```bash
npm install
npm run dev
```

## Architecture
*   **Agent**: `google.adk.agents.llm_agent.Agent`
*   **Communication**: Frontend -> Backend (8002) -> Shared Backend (8001) -> Firestore.
