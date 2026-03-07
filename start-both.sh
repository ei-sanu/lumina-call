#!/bin/bash
echo "🚀 Starting Lumina Call..."
echo ""
echo "Starting Backend Server on port 3001..."
cd server && npm run dev &
BACKEND_PID=$!
cd ..

sleep 2

echo ""
echo "Starting Frontend Server on port 8080..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers started!"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📍 Frontend: http://localhost:8080"
echo "📍 Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

wait
