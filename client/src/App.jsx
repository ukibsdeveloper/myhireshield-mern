import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import RegisterCompany from './pages/RegisterCompany';
import RegisterEmployee from './pages/RegisterEmployee';
import CompanyDashboard from './pages/CompanyDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeSearch from './pages/EmployeeSearch';
import EmployeeProfile from './pages/EmployeeProfile';
import SubmitReview from './pages/SubmitReview';
import ManageReviews from './pages/ManageReviews';
import UploadDocuments from './pages/UploadDocuments';
import VerifyDocuments from './pages/VerifyDocuments';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ConsentForm from './pages/ConsentForm';
import DataRights from './pages/DataRights';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center font-bold">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Loading Access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === 'company') {
      return <Navigate to="/dashboard/company" replace />;
    } else if (user?.role === 'employee') {
      return <Navigate to="/dashboard/employee" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register/company" element={<PublicRoute><RegisterCompany /></PublicRoute>} />
        <Route path="/register/employee" element={<PublicRoute><RegisterEmployee /></PublicRoute>} />
        
        {/* Legal & Shared Pages */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/consent" element={<ConsentForm />} />
        <Route path="/data-rights" element={<DataRights />} />
        
        {/* Company Exclusive Routes */}
        <Route 
          path="/dashboard/company" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/review/submit" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <SubmitReview />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/review/manage" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <ManageReviews />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/verify/documents" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <VerifyDocuments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/search" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <EmployeeSearch />
            </ProtectedRoute>
          } 
        />
        
        {/* Employee Exclusive Routes */}
        <Route 
          path="/dashboard/employee" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/documents/upload" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <UploadDocuments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/profile" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeProfile />
            </ProtectedRoute>
          } 
        />

        {/* Dynamic Shared Route (Profile view) */}
        <Route 
          path="/employee/:id" 
          element={
            <ProtectedRoute>
              <EmployeeProfile />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;