# How to Run This Project - Complete Guide 🚀

## Quick Start (3 Simple Steps)

### Step 1: Start AI Engine
```bash
cd ai_engine
venv\Scripts\activate
uvicorn main:app --host 127.0.0.1 --port 8000
```
✅ AI Engine running on http://127.0.0.1:8000

### Step 2: Start Backend
```bash
cd backend
node src/server.js
```
✅ Backend running on http://127.0.0.1:5000

### Step 3: Start Frontend
```bash
cd frontend
npm run dev -- --host 127.0.0.1
```
✅ Frontend running on http://127.0.0.1:5173

**🎉 Open your browser**: http://127.0.0.1:5173

---

## First Time Setup (One-Time Only)

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://www.python.org/downloads/))
- **MongoDB Atlas** account ([Sign up free](https://www.mongodb.com/cloud/atlas))

### 1. Backend Setup
```bash
cd backend
npm install

# Create .env file
echo MONGODB_URI=your_mongodb_connection_string > .env
echo JWT_SECRET=your_secret_key_here >> .env
echo AI_ENGINE_URL=http://127.0.0.1:8000 >> .env
echo PORT=5000 >> .env
```

### 2. AI Engine Setup
```bash
cd ai_engine

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

---

## Detailed Running Instructions

### Option A: Run All Services (Recommended)

**Windows PowerShell** (Run 3 separate terminals):

**Terminal 1 - AI Engine:**
```powershell
cd d:\fin\ai_engine
.\venv\Scripts\activate
uvicorn main:app --host 127.0.0.1 --port 8000
```

**Terminal 2 - Backend:**
```powershell
cd d:\fin\backend
node src/server.js
```

**Terminal 3 - Frontend:**
```powershell
cd d:\fin\frontend
npm run dev -- --host 127.0.0.1
```

### Option B: Using Background Processes

**Start all services in background:**
```powershell
# AI Engine
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\fin\ai_engine; .\venv\Scripts\activate; uvicorn main:app --host 127.0.0.1 --port 8000"

# Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\fin\backend; node src/server.js"

# Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\fin\frontend; npm run dev -- --host 127.0.0.1"
```

**Stop all services:**
```powershell
taskkill /F /IM node.exe /IM python.exe
```

---

## Troubleshooting

### Port Already in Use
```powershell
# Check what's using the port
netstat -ano | findstr :5000
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Kill the process
taskkill /F /PID <process_id>
```

### MongoDB Connection Failed
1. Check your MongoDB Atlas connection string in `backend/.env`
2. Ensure your IP is whitelisted in MongoDB Atlas
3. Verify database user has read/write permissions

### AI Engine Not Starting
```bash
# Ensure virtual environment is activated
cd ai_engine
venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt

# Download spaCy model again
python -m spacy download en_core_web_sm
```

### Frontend Build Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Testing the System

### 1. Register a Student Account
- Navigate to http://127.0.0.1:5173
- Click "Register"
- Fill in details with role: "student"

### 2. Upload Resume
- Login with student credentials
- Go to Dashboard
- Upload a PDF/DOCX resume
- Wait for AI analysis (3-5 seconds)

### 3. View Analytics
- Check **AI Placement Score** (PRS percentage)
- View **Technical Rank** (Elite/Expert/Professional/Developing)
- See **Skill Gaps** and recommendations

### 4. Play Cognitive Games
- Navigate to "Gaming Hub"
- Play any of the 5 games
- Check **Cognitive Index** on dashboard

### 5. View Detailed Report
- Click "View Analysis" on dashboard
- See PRS breakdown, XAI explanation, skill categorization

---

## Environment Variables Reference

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placement_db
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
AI_ENGINE_URL=http://127.0.0.1:8000
PORT=5000
NODE_ENV=development
```

### Frontend (.env) - Optional
```env
VITE_API_URL=http://127.0.0.1:5000
VITE_SOCKET_URL=http://127.0.0.1:5000
```

---

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://127.0.0.1:5173 | User interface |
| **Backend API** | http://127.0.0.1:5000 | REST API endpoints |
| **AI Engine** | http://127.0.0.1:8000 | Resume analysis |
| **API Docs** | http://127.0.0.1:8000/docs | FastAPI Swagger UI |

---

## Default User Roles

### Student
- Register with role: `student`
- Access: Dashboard, Resume Upload, Gaming Hub, Job Applications

### Recruiter
- Register with role: `recruiter`
- Access: Job Posting, Candidate Management, Applications

### Admin
- Register with role: `admin`
- Access: System Analytics, User Management

---

## Production Deployment

### Using Render (Recommended)

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy on Render**
- Go to [render.com](https://render.com)
- Connect GitHub repository
- Use included `render.yaml` for automatic deployment

3. **Set Environment Variables**
- Add `MONGODB_URI`, `JWT_SECRET` in Render dashboard
- Update frontend `VITE_API_URL` to production backend URL

---

## Performance Benchmarks

| Operation | Expected Time |
|-----------|---------------|
| Resume Upload & Analysis | 2-4 seconds |
| Dashboard Load | < 1 second |
| Game Score Save | < 500ms |
| Profile Fetch | < 300ms |

---

## Support

### Common Issues
- **"Module not found"**: Run `npm install` or `pip install -r requirements.txt`
- **"Port in use"**: Kill existing processes with `taskkill`
- **"MongoDB connection timeout"**: Check internet and Atlas whitelist
- **"spaCy model not found"**: Run `python -m spacy download en_core_web_sm`

### Getting Help
1. Check this documentation thoroughly
2. Review error messages in terminal
3. Verify all services are running
4. Check browser console for frontend errors

---

## System Architecture

```
Frontend (React) → Backend (Node.js) → AI Engine (Python)
                         ↓
                   MongoDB Atlas
```

**Data Flow**:
1. User uploads resume on Frontend
2. Frontend sends to Backend API
3. Backend forwards to AI Engine
4. AI Engine analyzes and returns PRS
5. Backend saves to MongoDB
6. Frontend displays results

---

**Last Updated**: February 3, 2026  
**Version**: 2.0.0  
**Status**: Production Ready ✅
