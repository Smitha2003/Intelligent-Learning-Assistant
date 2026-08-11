#!/bin/bash

echo "Starting CLMS Backend (FastAPI)..."
cd /home/smitha/Desktop/FinalYearProject/CLMS
source venv/bin/activate
uvicorn main:app --port 8000 &
PID_CLMS=$!

echo "Starting Notes App Backend (Express)..."
cd /home/smitha/Desktop/FinalYearProject/Notes_App/Backend
npm run dev &
PID_NOTES_BACKEND=$!

echo "Starting Notes App Frontend (React/Vite)..."
cd /home/smitha/Desktop/FinalYearProject/Notes_App/Frontend
npm run dev -- --port 5173 &
PID_NOTES_FRONTEND=$!

echo "Starting CLMS Dashboard (React/Vite)..."
cd /home/smitha/Desktop/FinalYearProject/CLMS-Dashboard/artifacts/clms-dashboard
PORT=5174 BASE_PATH=/ npm run dev -- --port 5174 &
PID_DASHBOARD=$!

echo ""
echo "==================================================="
echo "All services are running in the background!"
echo "==================================================="
echo "1. CLMS API (Python):       http://localhost:8000"
echo "2. Notes App API (Node):    http://localhost:5001"
echo "3. Notes App Frontend:      http://localhost:5173"
echo "4. CLMS Dashboard:          http://localhost:5174"
echo "==================================================="
echo "Note: If this is your first run, you may want to seed the database by opening a new terminal and running:"
echo "curl -X POST http://localhost:8000/reset"
echo "==================================================="
echo "To stop all services later, run this command:"
echo "kill $PID_CLMS $PID_NOTES_BACKEND $PID_NOTES_FRONTEND $PID_DASHBOARD"
echo "==================================================="
