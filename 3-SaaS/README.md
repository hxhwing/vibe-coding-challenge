# Vibe SaaS (Project 3)

A unified platform integrating **Checkmate** (Task Management) and **Stash** (Link Aggregation).

## Features
- **Shared Authentication**: Single Sign-On using Stash's Firestore backend.
- **Unified Dashboard**: Central hub to access all Vibe apps.
- **Material 3 Design**: Consistent, premium UI.

## Prerequisites
This project requires the **Stash Backend** to be running for Authentication logic.

## How to Run

### 1. Start the Shared Backend
The SaaS platform relies on the Stash backend for user authentication and data persistence.
```bash
# Open a new terminal
cd ../2-Stash/backend
source venv/bin/activate
uvicorn main:app --port 8001 --reload
```

### 2. Start the SaaS Frontend
```bash
# In the 3-SaaS directory
npm install  # If not already installed
npm run dev
```

### 3. Access the App
Open the URL shown in the terminal (usually `http://localhost:5173` or similar).

### 4. Log In
Use the same credentials you created for **Stash**.
- **Sign Up**: Create a new account if you haven't already.
- **Sign In**: Access the Dashboard.
