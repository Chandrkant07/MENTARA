# Mentara Quick Start Script
# PowerShell version for Windows

$ErrorActionPreference = "Stop"

Write-Host "🎯 Mentara Quick Start" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Visit: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Yellow
    exit 1
}

try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "📄 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env file with your configuration before production" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🐳 Starting services with Docker Compose..." -ForegroundColor Cyan
docker-compose up -d --build

Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "📊 Running database migrations..." -ForegroundColor Cyan
docker-compose exec backend python manage.py migrate

Write-Host ""
Write-Host "👤 Creating superuser..." -ForegroundColor Cyan
Write-Host "   Email: admin@demo.com, Password: Admin@123" -ForegroundColor Gray

$pythonScript = @"
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@demo.com').exists():
    User.objects.create_superuser(
        email='admin@demo.com',
        password='Admin@123',
        username='admin',
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    print('✅ Superuser created')
else:
    print('ℹ️  Superuser already exists')
"@

$pythonScript | docker-compose exec -T backend python manage.py shell

Write-Host ""
Write-Host "📁 Collecting static files..." -ForegroundColor Cyan
docker-compose exec backend python manage.py collectstatic --noinput

Write-Host ""
$seedChoice = Read-Host "🌱 Do you want to seed demo data? (yes/no)"
if ($seedChoice -eq "yes") {
    Write-Host "Seeding demo data..." -ForegroundColor Cyan
    docker-compose exec backend python manage.py seed_demo_data
    Write-Host "✅ Demo data seeded" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access your application:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "   Admin:     http://localhost:8000/admin" -ForegroundColor White
Write-Host ""
Write-Host "👤 Demo Accounts:" -ForegroundColor Cyan
Write-Host "   Admin:     admin@demo.com / Admin@123" -ForegroundColor White
Write-Host "   Teacher:   teacher@demo.com / Demo@123" -ForegroundColor White
Write-Host "   Student:   student1@demo.com / Demo@123" -ForegroundColor White
Write-Host ""
Write-Host "📊 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs:        docker-compose logs -f backend" -ForegroundColor Gray
Write-Host "   Stop services:    docker-compose down" -ForegroundColor Gray
Write-Host "   Restart:          docker-compose restart" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   Deployment:       DEPLOYMENT.md" -ForegroundColor Gray
Write-Host "   Admin Guide:      docs\ADMIN_GUIDE.md" -ForegroundColor Gray
Write-Host "   Project Status:   PROJECT_STATUS.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Magenta
