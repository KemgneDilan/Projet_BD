#!/bin/bash
# Script to start MongoDB and the application

# Obtenir le chemin absolu du dossier actuel
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "Starting MongoDB..."
sudo systemctl start mongodb 2>/dev/null || mongod --config /etc/mongod.conf 2>/dev/null || {
  echo "MongoDB not installed or could not be started with systemd. Trying fallback..."
  # Try to start mongod in background if available
  mongod &
}

sleep 2

echo "MongoDB started. Proceeding with application..."

# Define node executable (use local if available, else system node)
NODE_EXEC="node"
if [ -x "$DIR/node-v18.20.2-linux-x64/bin/node" ]; then
    NODE_EXEC="$DIR/node-v18.20.2-linux-x64/bin/node"
fi

# Start backend
echo "Starting backend..."
cd "$DIR/server"
$NODE_EXEC server.js &
BACKEND_PID=$!

sleep 2

# Start frontend
echo "Starting frontend..."
cd "$DIR"
# Try using npm to start dev server
npm run dev

# Cleanup
wait $BACKEND_PID