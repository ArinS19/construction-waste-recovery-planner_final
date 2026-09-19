@echo off
title Construction Waste Recovery Planner - Backend API
cd /d "%~dp0backend"

if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo Installing/verifying backend dependencies...
pip install --quiet --disable-pip-version-check -r requirements.txt

echo Starting FastAPI Backend on http://127.0.0.1:8000...
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
