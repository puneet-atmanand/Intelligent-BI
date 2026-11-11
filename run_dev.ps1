# Ask Your Data — Unified Development Runner
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         Starting Ask Your Data (Local Dev Mode)          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$pythonCmd = "python"
if (Test-Path "backend/venv/Scripts/python.exe") {
    $pythonCmd = "backend/venv/Scripts/python.exe"
    Write-Host "[Environment] Using virtual environment: backend\venv" -ForegroundColor Gray
}

# 1. Seed admin and demo dashboard if needed
Write-Host "`n[1/3] Checking demo data and database seeds..." -ForegroundColor Yellow
& $pythonCmd backend/scripts/seed_demo_dashboard.py

# 2. Start FastAPI Backend on port 8000
Write-Host "`n[2/3] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$pythonCmd' -m uvicorn --app-dir backend app.main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

# 3. Start Vite Frontend on port 5173
Write-Host "`n[3/3] Launching Vite Frontend on http://localhost:5173..." -ForegroundColor Green
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm --prefix frontend run dev" -PassThru

Write-Host "`n----------------------------------------------------------" -ForegroundColor Cyan
Write-Host " Ask Your Data is running!" -ForegroundColor Green
Write-Host " Web UI:     http://localhost:5173" -ForegroundColor White
Write-Host " REST API:   http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "----------------------------------------------------------" -ForegroundColor Cyan
