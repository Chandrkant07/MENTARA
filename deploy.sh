#!/bin/bash

# Mentara Deployment Script
# This script automates the deployment process for production

set -e  # Exit on error

echo "🚀 Mentara Production Deployment Script"
echo "========================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please copy .env.example to .env and configure it"
    exit 1
fi

# Load environment variables
source .env

# Confirm deployment
echo ""
echo "⚠️  You are about to deploy to production"
echo "Environment: ${ENVIRONMENT:-production}"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "📦 Step 1: Pulling latest changes..."
git pull origin main

echo ""
echo "🐳 Step 2: Building Docker images..."
docker-compose build --no-cache

echo ""
echo "🔄 Step 3: Stopping existing containers..."
docker-compose down

echo ""
echo "🚀 Step 4: Starting new containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "📊 Step 5: Running database migrations..."
docker-compose exec -T backend python manage.py migrate --noinput

echo ""
echo "📁 Step 6: Collecting static files..."
docker-compose exec -T backend python manage.py collectstatic --noinput

echo ""
echo "🧹 Step 7: Cleaning up old Docker images..."
docker image prune -f

echo ""
echo "🏥 Step 8: Health check..."
sleep 5
HEALTH_URL="${FRONTEND_URL:-http://localhost}/api/health/"
if curl -f $HEALTH_URL > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed - please investigate"
    docker-compose logs backend
    exit 1
fi

echo ""
echo "📋 Step 9: Container status..."
docker-compose ps

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📱 Application URLs:"
echo "   Frontend: ${FRONTEND_URL:-http://localhost:3000}"
echo "   Backend API: ${FRONTEND_URL:-http://localhost}/api"
echo "   Admin: ${FRONTEND_URL:-http://localhost}/admin"
echo ""
echo "📊 Monitor logs with:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""
echo "🎉 Happy deploying!"
