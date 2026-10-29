@echo off
start "AI Engine" cmd /k "cd /d C:\Users\acer\Downloads\fin\fin\ai_engine && venv\Scripts\activate && python -m uvicorn main:app --host 127.0.0.1 --port 8000"
timeout /t 5
start "Backend" cmd /k "cd /d C:\Users\acer\Downloads\fin\fin\backend && node src/server.js"
timeout /t 3
start "Frontend" cmd /k "cd /d C:\Users\acer\Downloads\fin\fin\frontend && npm run dev -- --host 127.0.0.1"
timeout /t 5
start http://127.0.0.1:5173