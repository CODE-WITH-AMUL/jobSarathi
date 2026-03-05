import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Landing from './pages/landing';
import Login from './account/candidate/login';
import Register from './account/candidate/register';
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
        {/* Provide safe no-op callbacks so these components render without required props */}
        <Route path="/login" element={<Login onLogin={() => {}} onToggleForm={() => {}} />} />
        <Route path="/register" element={<Register onRegister={() => {}} onToggleForm={() => {}} />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
