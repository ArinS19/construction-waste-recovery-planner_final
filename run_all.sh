#!/usr/bin/env bash
# Construction Waste Recovery Planner - Launcher (Linux/macOS)
# Linux/macOS equivalent of run_all.bat
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "======================================================================"
echo "  CONSTRUCTION WASTE RECOVERY PLANNER"
echo "  Machine Learning Decision Support System (Guardrail Protected)"
echo "======================================================================"
echo
echo "Launching Backend and Frontend services..."

"$DIR/run_backend.sh" &
BACKEND_PID=$!

cleanup() {
    echo
    echo "Stopping backend (pid $BACKEND_PID)..."
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

sleep 3
echo
echo "Services launched:"
echo " - Backend API:  http://127.0.0.1:8000 (Swagger docs at /docs)"
echo " - Frontend App: http://127.0.0.1:5173"
echo
echo "Press Ctrl+C to stop both services."
echo

# Runs in the foreground so Ctrl+C here also stops the backend via the trap above.
"$DIR/run_frontend.sh"
