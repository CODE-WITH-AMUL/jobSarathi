import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Landing from './pages/landing';
import CandidateDashboard from './components/candidate/Dashboard';
import CompanyDashboard from './components/company/Dashboard';
import CandidateProfile from './components/candidate/Profile';
import CompanyProfile from './components/company/Profile';
import ChooseAccountType from './account/choose/choose_account_type';
import CandidateLogin from './account/candidate/login';
import CandidateRegister from './account/candidate/register';
import CompanyLogin from './account/company/login';
import CompanyRegister from './account/company/register';

const PrivateRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'company' | 'candidate' }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    const loginPath = allowedRole ? `/account/${allowedRole}/login` : '/account/choose?mode=login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRole && user?.account_type !== allowedRole) {
    const dashboardPath = user?.account_type === 'company' ? '/company/dashboard' : '/candidate/dashboard';
    return <Navigate to={dashboardPath} replace />;
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
          path="/candidate/profile"
          element={
            <PrivateRoute allowedRole="candidate">
              <CandidateProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/company/profile"
          element={
            <PrivateRoute allowedRole="company">
              <CompanyProfile />
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
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);
