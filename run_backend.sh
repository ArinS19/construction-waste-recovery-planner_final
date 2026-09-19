#!/usr/bin/env bash
# Construction Waste Recovery Planner - Backend API (Linux/macOS)
# Linux/macOS equivalent of run_backend.bat
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/backend"

PYTHON_BIN="python3"
command -v "$PYTHON_BIN" >/dev/null 2>&1 || PYTHON_BIN="python"

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    "$PYTHON_BIN" -m venv venv
fi

# shellcheck disable=SC1091
source venv/bin/activate

echo "Installing/verifying backend dependencies..."
pip install --quiet --disable-pip-version-check -r requirements.txt

echo "Starting FastAPI Backend on http://127.0.0.1:8000..."
exec python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
