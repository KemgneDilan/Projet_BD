#!/bin/bash
# Script to start MongoDB and the application

echo "Starting MongoDB..."
sudo systemctl start mongodb 2>/dev/null || mongod --config /etc/mongod.conf 2>/dev/null || {
  echo "MongoDB not installed. Using fallback..."
  # Try to start mongod in background if available
  mongod &
}

sleep 2

echo "MongoDB started. Proceeding with application..."
cd /home/ndam/claude

# Start backend
echo "Starting backend..."
cd backend
/home/ndam/claude/node-v18.20.2-linux-x64/bin/node server.js &
BACKEND_PID=$!

sleep 2

# Start frontend
echo "Starting frontend..."
cd ..
/home/ndam/claude/node-v18.20.2-linux-x64/bin/node node_modules/.bin/vite

# Cleanup
wait $BACKEND_PID