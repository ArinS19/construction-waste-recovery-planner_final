#!/usr/bin/env bash
# Construction Waste Recovery Planner - Frontend UI (Linux/macOS)
# Linux/macOS equivalent of run_frontend.bat
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting Vite Frontend on http://127.0.0.1:5173..."
exec npm run dev -- --host 127.0.0.1 --port 5173
