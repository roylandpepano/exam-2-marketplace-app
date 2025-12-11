@echo off
echo ===============================================
echo Marketplace Admin Backend - Setup Script
echo ===============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.9 or higher
    pause
    exit /b 1
)

echo [1/5] Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo [ERROR] Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/5] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [4/5] Checking environment file...
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo [IMPORTANT] Please edit .env file with your database credentials
    echo Press any key to open .env file...
    pause >nul
    notepad .env
)

echo [5/5] Setup complete!
echo.
echo ===============================================
echo Next Steps:
echo ===============================================
echo 1. Make sure PostgreSQL is running
echo 2. Make sure Redis is running
echo 3. Update .env file with your database credentials
echo 4. Run: python init_db.py
echo 5. Run: python app.py
echo ===============================================
echo.
pause
