import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CreateTimetable from './pages/CreateTimetable';
import TeachersData from './pages/TeachersDataFull';
import ClassroomsData from './pages/ClassroomsDataFull';
import ProgramsData from './pages/ProgramsDataFull';
import InfrastructureData from './pages/InfrastructureDataSimple';
import GenerateTimetable from './pages/GenerateTimetable';
import ViewTimetable from './pages/ViewTimetable';

// Protected Route Component
const ProtectedRoute = ({ children, allowedUserType }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedUserType && user?.userType !== allowedUserType) {
    // Redirect to appropriate dashboard based on user type
    if (user?.userType === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/student-dashboard" replace />;
    }
  }
  
  return children;
};

// Main App Component
const AppContent = () => {
  const { checkAuth } = useAuth();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedUserType="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute allowedUserType="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-timetable" 
          element={
            <ProtectedRoute allowedUserType="admin">
              <CreateTimetable />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teachers-data" 
          element={
            <ProtectedRoute allowedUserType="admin">
              <TeachersData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/classrooms-data" 
          element={
            <ProtectedRoute allowedUserType="admin">
              <ClassroomsData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/programs-data" 
          element={
            <ProtectedRoute allowedUserType="admin">
              <ProgramsData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/infrastructure-data" 
          element={
            <ProtectedRoute allowedUserType="admin">
              <InfrastructureData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/generate-timetable" 
          element={
            <ProtectedRoute allowedUserType="admin">
              <GenerateTimetable />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/view-timetable" 
          element={
            <ProtectedRoute>
              <ViewTimetable />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// Root App Component with Auth and Theme Providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;