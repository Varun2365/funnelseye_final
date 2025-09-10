import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLayout from './components/AdminLayout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import SystemSettings from './components/SystemSettings';
import PaymentSettings from './components/PaymentSettings';
import Analytics from './components/Analytics';
import SubscriptionManagement from './components/SubscriptionManagement';
import CoursesManagement from './components/CoursesManagement';
import SupportTickets from './components/SupportTickets';
import PaymentManagement from './components/PaymentManagement';
import MlmManagement from './components/MlmManagement';
import AuditLogs from './components/AuditLogs';
import SecurityDashboard from './components/SecurityDashboard';
import FinancialDashboard from './components/FinancialDashboard';
import PlatformConfiguration from './components/PlatformConfiguration';
import { Toaster } from 'sonner';
import { ToastProvider } from './contexts/ToastContext';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, admin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && admin?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function AppContent() {
  const { isAuthenticated, loading, admin } = useAuth();
  
  console.log('🔐 [APP_CONTENT] Rendering with state:', { isAuthenticated, loading, admin: admin ? 'exists' : 'null' });

  if (loading) {
    console.log('🔐 [APP_CONTENT] Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  console.log('🔐 [APP_CONTENT] Not loading, isAuthenticated:', isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="system-settings" element={<SystemSettings />} />
          <Route path="payment-settings" element={<PaymentSettings />} />
          <Route path="payment-management" element={<PaymentManagement />} />
          <Route path="financial" element={<FinancialDashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="subscription" element={<SubscriptionManagement />} />
            <Route path="courses" element={<CoursesManagement />} />
            <Route path="support" element={<SupportTickets />} />
            <Route path="mlm-management" element={<MlmManagement />} />
            <Route path="security" element={<SecurityDashboard />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="platform-config" element={<PlatformConfiguration />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;