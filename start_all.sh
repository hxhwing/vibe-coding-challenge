#!/bin/bash

# Kill existing processes on ports 8001, 8002, 5173, 5174, 5175, 5176
echo "Stopping existing services..."
lsof -ti:8001 | xargs kill -9 2>/dev/null
lsof -ti:8002 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:5174 | xargs kill -9 2>/dev/null
lsof -ti:5175 | xargs kill -9 2>/dev/null
lsof -ti:5176 | xargs kill -9 2>/dev/null

echo "Starting Shared Backend (Port 8001)..."
cd 2-Stash/backend
source venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8001 > ../../shared_backend.log 2>&1 &
echo "Shared Backend PID: $!"
cd ../..

echo "Starting Assistant Backend (Port 8002)..."
cd 4-PersonalAssistant/backend
source venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8002 > ../../assistant_backend.log 2>&1 &
echo "Assistant Backend PID: $!"
cd ../..

echo "Starting Checkmate (Standalone - Port 5173)..."
cd 1-Checkmate
nohup npm run dev -- --host --port 5173 > ../checkmate_frontend.log 2>&1 &
echo "Checkmate Frontend PID: $!"
cd ..

echo "Starting Stash (Standalone - Port 5174)..."
cd 2-Stash
nohup npm run dev -- --host --port 5174 > ../stash_frontend.log 2>&1 &
echo "Stash Frontend PID: $!"
cd ..

echo "Starting Vibe One SaaS (Port 5175)..."
cd 3-SaaS
nohup npm run dev -- --host --port 5175 > ../saas_frontend.log 2>&1 &
echo "SaaS Frontend PID: $!"
cd ..

echo "Starting Assistant Frontend (Standalone - Port 5176)..."
cd 4-PersonalAssistant
nohup npm run dev -- --host --port 5176 > ../assistant_frontend.log 2>&1 &
echo "Assistant Frontend PID: $!"
cd ..

echo "All services started! Access them via http://<YOUR_IP>:<PORT>"
echo "Checkmate: Port 5173"
echo "Stash:     Port 5174"
echo "Vibe One:  Port 5175"
echo "Assistant: Port 5176"
