# Smart Campus Placement Platform

## Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB (Local or Atlas Connection String)

## 1. Backend Setup (Node.js)
The backend runs on Port `5000`.

```bash
cd backend
npm install
# Create .env file if not exists (Sample in .env.example)
# ENV Variables: MONGODB_URI, JWT_SECRET
npm start
```

## 2. AI Engine Setup (Python)
The AI Service runs on Port `8000`.

```bash
cd ai_engine
# Optional: Create virtual environment
# python -m venv venv
# source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate     # Windows

pip install -r requirements.txt
python main.py
```

## 3. Frontend Setup (React)
The Frontend runs on Port `5173` (Vite default).

```bash
cd frontend
npm install
npm run dev
```

## Accessing the App
Open your browser and navigate to: [http://localhost:5173](http://localhost:5173)

## Default Roles
You can register new users for each role:
- **Student**: Register -> Upload Resume -> Dashboard
- **Recruiter**: Register -> Post Job -> Dashboard
- **Admin**: Register -> Dashboard (Role: 'admin')
