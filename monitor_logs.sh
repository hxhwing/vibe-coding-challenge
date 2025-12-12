#!/bin/bash

echo "Monitoring logs... (Press Ctrl+C to stop)"
echo "----------------------------------------"

# Check if log files exist
if [ ! -f "shared_backend.log" ]; then
    echo "Waiting for logs to be created..."
    sleep 2
fi

# Tail all logs
tail -f shared_backend.log assistant_backend.log saas_frontend.log checkmate_frontend.log stash_frontend.log assistant_frontend.log 2>/dev/null
