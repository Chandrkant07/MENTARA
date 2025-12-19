# Mentara - Quick Start Script for Windows PowerShell
# This script sets up and runs the Mentara platform

Write-Host "🎯 Mentara - Quick Start" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.10+" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Setting up Backend..." -ForegroundColor Cyan
Write-Host ""

# Virtual environment (prefer .venv; do NOT rely on Activate.ps1 due to possible Group Policy blocks)
$venvPath = ".venv"
$venvPython = Join-Path $venvPath "Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "Creating virtual environment ($venvPath)..." -ForegroundColor Yellow
    python -m venv $venvPath
}

Write-Host "Using venv Python: $venvPython" -ForegroundColor Yellow

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
& $venvPython -m pip install -q -r requirements.txt

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
& $venvPython manage.py migrate

# Setup fixed users
Write-Host "Setting up admin and teacher accounts..." -ForegroundColor Yellow
& $venvPython manage.py setup_fixed_users

Write-Host ""
Write-Host "✅ Backend setup complete!" -ForegroundColor Green
Write-Host ""

# Frontend setup
Write-Host "📦 Setting up Frontend..." -ForegroundColor Cyan
Write-Host ""

Set-Location frontend

# Install npm dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    "VITE_API_URL=http://localhost:8000" | Out-File -FilePath ".env" -Encoding utf8
}

Set-Location ..

Write-Host ""
Write-Host "✅ Frontend setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "🎉 Setup Complete! Ready to start Mentara" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Fixed Credentials:" -ForegroundColor Yellow
Write-Host "   👤 Admin:   username=admin,   password=admin123" -ForegroundColor White
Write-Host "   👨‍🏫 Teacher: username=teacher, password=teacher123" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Change these passwords after first login!" -ForegroundColor Red
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "   python manage.py runserver" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📱 Access Points:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "   Admin:    http://localhost:8000/admin" -ForegroundColor White
Write-Host ""
Write-Host "💡 Need help? Check README_MENTARA.md" -ForegroundColor Yellow
Write-Host ""

# Ask if user wants to start servers now
$start = Read-Host "Would you like to start the servers now? (y/n)"

if ($start -eq "y" -or $start -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Starting Backend Server..." -ForegroundColor Cyan
    
    # Start backend in new terminal
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\IBenv\Scripts\Activate.ps1; python manage.py runserver"
    
    Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    
    # Start frontend in new terminal
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"
    
    Write-Host ""
    Write-Host "✅ Servers started in separate windows!" -ForegroundColor Green
    Write-Host "   Frontend will open at: http://localhost:3000" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "👍 You can start the servers manually later." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Happy testing! 🎯" -ForegroundColor Cyan
