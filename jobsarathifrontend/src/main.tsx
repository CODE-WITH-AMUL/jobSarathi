import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/landing';
import CompanyDashboard from './pages/CompanyDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import Profile from './components/candidate/Profile';
import ChooseAccountType from './account/choose/choose_account_type';
import CandidateLogin from './account/candidate/login';
import CandidateRegister from './account/candidate/register';
import CompanyLogin from './account/company/login';
import CompanyRegister from './account/company/register';

const PrivateRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'company' | 'candidate' }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (allowedRole && user?.account_type !== allowedRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/account/choose" element={<ChooseAccountType />} />
        <Route
          path="/account/candidate/login"
          element={<CandidateLogin onLogin={() => {}} onToggleForm={() => {}} />}
        />
        <Route
          path="/account/candidate/register"
          element={<CandidateRegister onRegister={() => {}} onToggleForm={() => {}} />}
        />
        <Route path="/account/company/login" element={<CompanyLogin />} />
        <Route path="/account/company/register" element={<CompanyRegister />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/company/dashboard" 
          element={
            <PrivateRoute allowedRole="company">
              <CompanyDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/candidate/dashboard" 
          element={
            <PrivateRoute allowedRole="candidate">
              <CandidateDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } 
        />

        {/* Catch all redirect to landing */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
