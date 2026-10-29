import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AnalysisResult from './pages/student/AnalysisResult';
import JobMatching from './pages/student/JobMatching';
import ProfileEdit from './pages/student/ProfileEdit';
import GamingHub from './pages/student/GamingHub';
import JobDetails from './pages/recruiter/JobDetails';
import StudentLayout from './components/StudentLayout';
import RecruiterLayout from './components/RecruiterLayout';
import SocketManager from './components/SocketManager';
import Chatbot from './pages/Chatbot';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  // ... existing protected route logic ...
  // (Implied leave unchanged)
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  console.log("ProtectedRoute Check:", { role, userRole: userInfo?.role });

  if (!userInfo) {
    console.log("ProtectedRoute: No user info, redirecting.");
    return <Navigate to="/" />;
  }

  if (role && userInfo.role?.toLowerCase() !== role.toLowerCase()) {
    console.log(`ProtectedRoute: Role mismatch. Required: ${role}, Found: ${userInfo.role}`);
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <SocketManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute role="student">
            <StudentLayout>
              <StudentDashboard />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/analysis" element={
          <ProtectedRoute role="student">
            <StudentLayout>
              <AnalysisResult />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/jobs" element={
          <ProtectedRoute role="student">
            <StudentLayout>
              <JobMatching />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/profile-edit" element={
          <ProtectedRoute role="student">
            <StudentLayout>
              <ProfileEdit />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/games" element={
          <ProtectedRoute role="student">
            <StudentLayout>
              <GamingHub />
            </StudentLayout>
          </ProtectedRoute>
        } />

        {/* Recruiter Routes */}
        <Route path="/recruiter/dashboard" element={
          <ProtectedRoute role="recruiter">
            <RecruiterLayout>
              <RecruiterDashboard />
            </RecruiterLayout>
          </ProtectedRoute>
        } />
        <Route path="/recruiter/job/:jobId" element={
          <ProtectedRoute role="recruiter">
            <RecruiterLayout>
              <JobDetails />
            </RecruiterLayout>
          </ProtectedRoute>
        } />

        <Route path="/company/dashboard" element={<Navigate to="/recruiter/dashboard" replace />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Public Chatbot Route */}
        <Route path="/chatbot" element={<Chatbot />} />

        {/* Catch all - 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
