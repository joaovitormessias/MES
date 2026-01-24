#!/bin/bash

# MES RENAR Backend - Setup Script

set -e

echo "🚀 MES RENAR Backend Setup"
echo "=========================="

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js 20+ required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version OK: $(node -v)"

# Check Docker
echo "Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker not found. Please install Docker."
    exit 1
fi
echo "✅ Docker OK: $(docker --version)"

# Check Docker Compose
echo "Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose not found. Please install Docker Compose."
    exit 1
fi
echo "✅ Docker Compose OK: $(docker-compose --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Copy environment file if not exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration"
else
    echo "✅ .env file already exists"
fi

# Start Docker containers
echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
npm run prisma:migrate

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npm run prisma:generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your ERP and equipment integration settings"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000/health to verify"
echo ""
echo "Optional:"
echo "- Run 'docker-compose --profile tools up -d' to start PgAdmin and RedisInsight"
echo "- Run 'npm run prisma:studio' to open Prisma Studio"
