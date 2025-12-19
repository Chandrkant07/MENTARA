# Mentara Production Deployment Script
# PowerShell version for Windows

$ErrorActionPreference = "Stop"

Write-Host "🚀 Mentara Production Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and configure it"
    exit 1
}

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}

# Confirm deployment
Write-Host ""
Write-Host "⚠️  You are about to deploy to production" -ForegroundColor Yellow
$environment = $env:ENVIRONMENT
if (-not $environment) { $environment = "production" }
Write-Host "Environment: $environment"
$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Deployment cancelled"
    exit 0
}

Write-Host ""
Write-Host "📦 Step 1: Pulling latest changes..." -ForegroundColor Green
git pull origin main

Write-Host ""
Write-Host "🐳 Step 2: Building Docker images..." -ForegroundColor Green
docker-compose build --no-cache

Write-Host ""
Write-Host "🔄 Step 3: Stopping existing containers..." -ForegroundColor Green
docker-compose down

Write-Host ""
Write-Host "🚀 Step 4: Starting new containers..." -ForegroundColor Green
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "📊 Step 5: Running database migrations..." -ForegroundColor Green
docker-compose exec -T backend python manage.py migrate --noinput

Write-Host ""
Write-Host "📁 Step 6: Collecting static files..." -ForegroundColor Green
docker-compose exec -T backend python manage.py collectstatic --noinput

Write-Host ""
Write-Host "🧹 Step 7: Cleaning up old Docker images..." -ForegroundColor Green
docker image prune -f

Write-Host ""
Write-Host "🏥 Step 8: Health check..." -ForegroundColor Green
Start-Sleep -Seconds 5
$healthUrl = $env:FRONTEND_URL
if (-not $healthUrl) { $healthUrl = "http://localhost" }
$healthUrl = "$healthUrl/api/health/"

try {
    $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Health check failed - please investigate" -ForegroundColor Yellow
    docker-compose logs backend
    exit 1
}

Write-Host ""
Write-Host "📋 Step 9: Container status..." -ForegroundColor Green
docker-compose ps

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Application URLs:" -ForegroundColor Cyan
$frontendUrl = $env:FRONTEND_URL
if (-not $frontendUrl) { $frontendUrl = "http://localhost:3000" }
Write-Host "   Frontend: $frontendUrl"
Write-Host "   Backend API: $frontendUrl/api"
Write-Host "   Admin: $frontendUrl/admin"
Write-Host ""
Write-Host "📊 Monitor logs with:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f backend"
Write-Host "   docker-compose logs -f frontend"
Write-Host ""
Write-Host "🎉 Happy deploying!" -ForegroundColor Magenta
