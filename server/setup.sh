#!/bin/bash

echo "==============================================="
echo "Marketplace Admin Backend - Setup Script"
echo "==============================================="
echo ""

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "[ERROR] Python 3 is not installed"
    echo "Please install Python 3.9 or higher"
    exit 1
fi

echo "[1/5] Creating virtual environment..."
python -m venv venv
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to create virtual environment"
    exit 1
fi

echo "[2/5] Activating virtual environment..."
source ./venv/Scripts/activate

echo "[3/5] Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    exit 1
fi

echo "[4/5] Checking environment file..."
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "[IMPORTANT] Please edit .env file with your database credentials"
    echo "Opening .env file..."
    ${EDITOR:-nano} .env
fi

echo "[5/5] Setup complete!"
echo ""
echo "==============================================="
echo "Next Steps:"
echo "==============================================="
echo "1. Make sure PostgreSQL is running"
echo "2. Make sure Redis is running"
echo "3. Update .env file with your database credentials"
echo "4. Run: python init_db.py"
echo "5. Run: python app.py"
echo "==============================================="
echo ""
