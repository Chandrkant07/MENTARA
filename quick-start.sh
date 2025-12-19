#!/bin/bash

# Mentara Quick Start Script
# This script helps you get started with development or demo quickly

set -e

echo "🎯 Mentara Quick Start"
echo "====================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before proceeding to production"
else
    echo "✅ .env file exists"
fi

echo ""
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 15

echo ""
echo "📊 Running database migrations..."
docker-compose exec backend python manage.py migrate

echo ""
echo "👤 Creating superuser..."
echo "   Use email: admin@demo.com, password: Admin@123"
docker-compose exec -T backend python manage.py shell <<EOF
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
EOF

echo ""
echo "📁 Collecting static files..."
docker-compose exec backend python manage.py collectstatic --noinput

echo ""
read -p "🌱 Do you want to seed demo data? (yes/no): " seed_choice
if [ "$seed_choice" = "yes" ]; then
    echo "Seeding demo data..."
    docker-compose exec backend python manage.py seed_demo_data
    echo "✅ Demo data seeded"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📱 Access your application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   Admin:     http://localhost:8000/admin"
echo ""
echo "👤 Demo Accounts:"
echo "   Admin:     admin@demo.com / Admin@123"
echo "   Teacher:   teacher@demo.com / Demo@123"
echo "   Student:   student1@demo.com / Demo@123"
echo ""
echo "📊 Useful commands:"
echo "   View logs:        docker-compose logs -f backend"
echo "   Stop services:    docker-compose down"
echo "   Restart:          docker-compose restart"
echo ""
echo "📚 Documentation:"
echo "   Deployment:       DEPLOYMENT.md"
echo "   Admin Guide:      docs/ADMIN_GUIDE.md"
echo "   Project Status:   PROJECT_STATUS.md"
echo ""
echo "Happy coding! 🚀"
