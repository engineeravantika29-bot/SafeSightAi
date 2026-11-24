@echo off
setlocal enabledelayedexpansion
title SafeSight AI - Launcher

echo =======================================================================
echo          SafeSight AI - Near-Miss Intelligence System
echo     PRASUNEX INNOVATHON 2026 - Calibrated Decision Support
echo =======================================================================
echo.
echo [1/4] Checking environment requirements...

:: Verify Python
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python was not found in PATH. Please install Python 3.11+.
    pause
    exit /b 1
)

:: Verify Node / NPM
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm was not found in PATH. Please install Node.js 18+.
    pause
    exit /b 1
)

set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%safesight-ai\backend"
set "FRONTEND_DIR=%PROJECT_DIR%safesight-ai\frontend"

if not exist "%BACKEND_DIR%" (
    set "BACKEND_DIR=%PROJECT_DIR%backend"
)
if not exist "%FRONTEND_DIR%" (
    set "FRONTEND_DIR=%PROJECT_DIR%frontend"
)

echo [OK] Python and Node.js detected.
echo.

echo [2/4] Starting SafeSight AI FastAPI Backend (Port 8000)...
start "SafeSight AI - Backend Server" cmd /k "cd /d "%BACKEND_DIR%" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Give backend 2 seconds to initialize
timeout /t 2 /nobreak >nul

echo [3/4] Starting SafeSight AI React/Vite Frontend (Port 5173)...
start "SafeSight AI - Frontend Dev Server" cmd /k "cd /d "%FRONTEND_DIR%" && npm.cmd run dev"

:: Give Vite 3 seconds to spin up
timeout /t 3 /nobreak >nul

echo [4/4] Opening SafeSight AI in your default web browser...
start http://localhost:5173

echo.
echo =======================================================================
echo  SafeSight AI is now running!
echo  ---------------------------------------------------------------------
echo  Frontend UI:    http://localhost:5173
echo  Backend API:    http://127.0.0.1:8000
echo  API Docs:       http://127.0.0.1:8000/docs
echo.
echo  Keep the opened backend and frontend terminal windows running.
echo  To shut down SafeSight AI, simply close those terminal windows.
echo =======================================================================
echo.
pause
