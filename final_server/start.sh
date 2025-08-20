#!/bin/bash

# Final Analytics API Server Startup Script

echo "🚀 Starting Final Analytics API Server..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your Supabase credentials:"
    echo ""
    echo "SUPABASE_URL=your_supabase_url_here"
    echo "SUPABASE_ANON_KEY=your_supabase_anon_key_here"
    echo "PORT=3002"
    echo "FRONTEND_URL=http://localhost:3000"
    echo ""
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "✅ Starting server on port 3002..."
echo "📊 API will be available at: http://localhost:3002/api/v1"
echo "🔍 Health check: http://localhost:3002/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start


