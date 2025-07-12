#!/bin/bash

echo "🚀 Deploying Skill-Swap Platform to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Set up your database on Neon"
echo "   2. Add environment variables in Vercel dashboard:"
echo "      - DATABASE_URL"
echo "      - JWT_SECRET"
echo "   3. Run database migrations: npm run db:push" 