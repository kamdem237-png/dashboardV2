import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Upload from './pages/Upload';
import DashboardView from './pages/DashboardView';
import StudentDashboard from './pages/StudentDashboard';
import FilteredStudents from './pages/FilteredStudents';
import Profile from './pages/Profile';
import History from './pages/History';
import HowItWorks from './pages/HowItWorks';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/dashboard/:id" element={<DashboardView />} />
                    <Route path="/student/:id" element={<StudentDashboard />} />
                    <Route path="/filtered-students" element={<FilteredStudents />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
