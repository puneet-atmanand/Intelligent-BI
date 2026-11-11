@echo off
title Ask Your Data Dev Server
echo ==========================================================
echo          Starting Ask Your Data (Local Dev Mode)
echo ==========================================================

set PYTHON_CMD=python
if exist "backend\venv\Scripts\python.exe" (
    set PYTHON_CMD="backend\venv\Scripts\python.exe"
    echo [Environment] Using virtual environment: backend\venv
)

echo [1/3] Checking demo data and database seeds...
%PYTHON_CMD% backend\scripts\seed_demo_dashboard.py

echo [2/3] Launching FastAPI Backend on http://127.0.0.1:8000...
start "Ask Your Data Backend" cmd /k "%PYTHON_CMD% -m uvicorn --app-dir backend app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Launching Vite Frontend on http://localhost:5173...
start "Ask Your Data Frontend" cmd /k "npm --prefix frontend run dev"

echo.
echo ==========================================================
echo  Ask Your Data is launching!
echo  Web UI:     http://localhost:5173
echo  REST API:   http://127.0.0.1:8000/docs
echo ==========================================================
