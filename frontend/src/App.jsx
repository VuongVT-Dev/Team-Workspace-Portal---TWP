import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import WorkspacePage from './pages/WorkspacePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMembersPage from './pages/AdminMembersPage';
import ScheduleLeavePage from './pages/ScheduleLeavePage';
import MeetingPage from './pages/MeetingPage';
import ExtensionsPage from './pages/ExtensionsPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white text-xs">
        Đang khởi động Team Workspace Portal TWP...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin-only Route Guard
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/workspace" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/members"
              element={
                <AdminRoute>
                  <AdminMembersPage />
                </AdminRoute>
              }
            />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/schedule" element={<ScheduleLeavePage />} />
            <Route path="/meetings" element={<MeetingPage />} />
            <Route path="/extensions" element={<ExtensionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
