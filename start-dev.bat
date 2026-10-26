@echo off
echo ===================================================
echo   NammaSeve (ನಮ್ಮ ಸೇವೆ) — Local Development Server
echo   AI-Powered Citizen Scheme Discovery Platform
echo ===================================================
echo.

cd /d "%~dp0frontend"

if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo Starting Vite development server...
echo Open your browser at http://localhost:5173
call npm run dev
pause
