// ======================
//  components/Navbar.tsx
// ======================

import React, { useState, useEffect } from 'react';
import { fetchWebsiteSettings, type WebsiteSettings } from '../api/websiteSettings';

const DEFAULT_NAME = 'Job Sarathi';
const DEFAULT_TAGLINE = 'नेपालको जागिर साथी';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    fetchWebsiteSettings()
      .then(setSettings)
      .catch(() => setSettings({ name: null, logo: null }));
  }, []);

  const siteName = settings?.name ?? DEFAULT_NAME;

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          {settings?.logo ? (
            <img src={settings.logo} alt={siteName} className="w-10 h-10 object-contain rounded-3xl" />
          ) : (
            <div className="w-10 h-10 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-bold text-3xl tracking-tighter">JS</div>
          )}
          <div>
            <div className="font-bold text-3xl tracking-tighter text-slate-950">{siteName}</div>
            <div className="text-[10px] -mt-1 text-slate-500 font-medium">{DEFAULT_TAGLINE}</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-x-10 text-sm font-medium text-slate-600">
          <a href="#jobs" className="hover:text-indigo-700 transition-colors">Find Jobs</a>
          <a href="#how" className="hover:text-indigo-700 transition-colors">How it Works</a>
          <a href="#stories" className="hover:text-indigo-700 transition-colors">Success Stories</a>
          <a href="#resources" className="hover:text-indigo-700 transition-colors">Resources</a>
        </div>

        <div className="hidden md:flex items-center gap-x-4">
          <button onClick={() => alert('Login flow opens here')} className="px-7 py-3 text-sm font-semibold border border-slate-300 hover:border-slate-400 text-slate-700 rounded-3xl transition-all active:scale-95">Log in</button>
          <button onClick={() => alert('Post a job flow')} className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-3xl transition-all active:scale-95 shadow-md">Post a Job</button>
        </div>

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden w-11 h-11 flex items-center justify-center text-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6h12v12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-white px-6 py-8 space-y-6 text-lg">
          <a href="#jobs" className="block py-2">Find Jobs</a>
          <a href="#how" className="block py-2">How it Works</a>
          <a href="#stories" className="block py-2">Success Stories</a>
          <div className="pt-6 border-t flex flex-col gap-4">
            <button className="py-4 border-2 border-slate-300 text-slate-700 rounded-3xl font-medium">Log in</button>
            <button className="py-4 bg-indigo-600 text-white rounded-3xl font-semibold">Post a Job</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;