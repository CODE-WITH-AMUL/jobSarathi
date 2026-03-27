import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Landing from './pages/landing';
import ChooseAccountType from './account/choose/choose_account_type';
import CandidateLogin from './account/candidate/login';
import CandidateRegister from './account/candidate/register';
import CompanyLogin from './account/company/login';
import CompanyRegister from './account/company/register';
import Profile from './components/candidate/Profile';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Account Selection and Auth Routes */}
        <Route path="/account/choose" element={<ChooseAccountType />} />
        
        {/* Candidate Routes */}
        <Route path="/account/candidate/login" element={<CandidateLogin onLogin={() => {}} onToggleForm={() => {}} />} />
        <Route path="/account/candidate/register" element={<CandidateRegister onRegister={() => {}} onToggleForm={() => {}} />} />
        
        {/* Company Routes */}
        <Route path="/account/company/login" element={<CompanyLogin />} />
        <Route path="/account/company/register" element={<CompanyRegister />} />
        
        {/* Legacy routes for backward compatibility */}
        <Route path="/login" element={<CandidateLogin onLogin={() => {}} onToggleForm={() => {}} />} />
        <Route path="/register" element={<CandidateRegister onRegister={() => {}} onToggleForm={() => {}} />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
