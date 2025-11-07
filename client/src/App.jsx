import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Demo from './pages/Demo';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateTimetable from './pages/CreateTimetable';
import UserManagement from './pages/UserManagement';
import StudentManagement from './pages/StudentManagement';
import TeachersData from './pages/TeachersManagement';
import ClassroomsData from './pages/ClassroomsDataFull';
import ProgramsData from './pages/ProgramsDataFull';
import InfrastructureData from './pages/InfrastructureDataSimple';
import GenerateTimetable from './pages/GenerateTimetable';
import ViewTimetable from './pages/ViewTimetable';
import QueryResolution from './pages/QueryResolution';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole) {
    const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!allowedRoles.includes(user?.role)) {
      // Redirect to appropriate dashboard based on user role
      if (user?.role === 'admin') {
        return <Navigate to="/admin-dashboard" replace />;
      } else if (user?.role === 'faculty') {
        return <Navigate to="/teacher-dashboard" replace />;
      } else {
        return <Navigate to="/student-dashboard" replace />;
      }
    }
  }
  
  return children;
};

// Main App Component
const AppContent = () => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRole={["admin", "faculty"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher-dashboard" 
          element={
            <ProtectedRoute allowedRole="faculty">
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-timetable" 
          element={
            <ProtectedRoute allowedRole={["admin", "faculty"]}>
              <CreateTimetable />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user-management" 
          element={
            <ProtectedRoute allowedRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teachers-data" 
          element={
            <ProtectedRoute allowedRole={["admin", "faculty"]}>
              <TeachersData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student-management" 
          element={
            <ProtectedRoute allowedRole={["admin", "faculty"]}>
              <StudentManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/classrooms-data" 
          element={
            <ProtectedRoute allowedRole={["admin", "faculty"]}>
              <ClassroomsData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/programs-data" 
          element={
            <ProtectedRoute allowedRole={["admin", "faculty"]}>
              <ProgramsData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/infrastructure-data" 
          element={
            <ProtectedRoute allowedRole={["admin", "faculty"]}>
              <InfrastructureData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/generate-timetable" 
          element={
            <ProtectedRoute allowedRole={["admin", "faculty"]}>
              <GenerateTimetable />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/view-timetable" 
          element={
            <ProtectedRoute allowedRole={["admin", "faculty"]}>
              <ViewTimetable />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/view-timetable/:id" 
          element={
            <ProtectedRoute allowedRole={["admin", "faculty"]}>
              <ViewTimetable />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/query-resolution" 
          element={
            <ProtectedRoute allowedRole={["admin", "faculty"]}>
              <QueryResolution />
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