#!/bin/bash

# Function to kill process on port
kill_port() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti:"$port" | xargs kill -9 2>/dev/null
    elif command -v fuser >/dev/null 2>&1; then
        fuser -k "$port/tcp" >/dev/null 2>&1
    else
        echo "Warning: 'lsof' or 'fuser' not found. Could not auto-kill process on port $port."
        echo "Please ensure port $port is free."
    fi
}

# Function to setup backend
setup_backend() {
    local service_name=$1
    local dir=$2
    local port=$3
    
    echo "--------------------------------------------------"
    echo "Setting up $service_name ($dir)..."
    cd "$dir" || exit

    # Create venv if not exists or broken
    if [ ! -f "venv/bin/activate" ]; then
        echo "Creating virtual environment..."
        rm -rf venv # Clean up potential broken dir
        python3 -m venv venv
        
        if [ ! -f "venv/bin/activate" ]; then
            echo "Error: Failed to create venv. Check if 'python3-venv' is installed."
            exit 1
        fi
    fi

    # Activate venv
    source venv/bin/activate

    # Install dependencies
    if [ -f "requirements.txt" ]; then
        echo "Installing requirements..."
        pip install -r requirements.txt > /dev/null 2>&1
    fi

    # Start service
    echo "Starting $service_name on port $port..."
    nohup uvicorn main:app --host 0.0.0.0 --port "$port" > "../../${service_name// /_}.log" 2>&1 &
    echo "$service_name PID: $!"
    
    cd - > /dev/null || exit
}

# Function to setup frontend
setup_frontend() {
    local service_name=$1
    local dir=$2
    local port=$3
    
    echo "--------------------------------------------------"
    echo "Setting up $service_name ($dir)..."
    cd "$dir" || exit

    # Install dependencies if node_modules missing
    if [ ! -d "node_modules" ]; then
        echo "Installing npm dependencies..."
        npm install > /dev/null 2>&1
    fi

    # Start service
    echo "Starting $service_name on port $port..."
    nohup npm run dev -- --host --port "$port" > "../../${service_name// /_}.log" 2>&1 &
    echo "$service_name PID: $!"
    
    cd - > /dev/null || exit
}

# --- Main Execution ---

# Kill existing processes
echo "Stopping existing services..."
for port in 8001 8002 5173 5174 5175 5176; do
    kill_port "$port"
done

# Setup Backends
setup_backend "Shared Backend" "2-Stash/backend" 8001
setup_backend "Assistant Backend" "4-PersonalAssistant/backend" 8002

# Setup Frontends
setup_frontend "Checkmate Frontend" "1-Checkmate" 5173
setup_frontend "Stash Frontend" "2-Stash" 5174
setup_frontend "Vibe One SaaS" "3-SaaS" 5175
setup_frontend "Assistant Frontend" "4-PersonalAssistant" 5176

echo "--------------------------------------------------"
echo "All services started! Check logs (*.log) for details."
echo "Access them via http://<YOUR_IP>:<PORT>"
echo "Checkmate: Port 5173"
echo "Stash:     Port 5174"
echo "Vibe One:  Port 5175"
echo "Assistant: Port 5176"
