@echo off
title Construction Waste Recovery Planner - Frontend UI
cd /d "%~dp0frontend"
set PATH=C:\Program Files\nodejs;%PATH%

if not exist node_modules (
    echo Installing frontend dependencies...
    call npm.cmd install
)

echo Starting Vite Frontend on http://127.0.0.1:5173...
call npm.cmd run dev -- --host 127.0.0.1 --port 5173
pause
