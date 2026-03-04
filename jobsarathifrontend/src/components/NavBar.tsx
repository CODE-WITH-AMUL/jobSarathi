// ======================
//  components/Navbar.tsx
// ======================

import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, Briefcase, Info, Award, BookOpen, User } from 'lucide-react';
// Assuming this is your API utility
import { fetchWebsiteSettings, type WebsiteSettings } from '../api/websiteSettings';

const DEFAULT_NAME = 'Job Sarathi';
const DEFAULT_TAGLINE = 'नेपालको जागिर साथी';

// 1. Extract navigation data to keep the render method clean and maintainable
const NAV_LINKS = [
  { label: 'Find Jobs', href: '#jobs', icon: Briefcase },
  { label: 'How it Works', href: '#how', icon: Info },
  { label: 'Success Stories', href: '#stories', icon: Award },
  { label: 'Resources', href: '#resources', icon: BookOpen },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  
  // Optional: Track active section for highlighting
  const [activePath, setActivePath] = useState('#jobs'); 
  
  // Optional: Mock authentication state to demonstrate the notification bell and profile
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  useEffect(() => {
    fetchWebsiteSettings()
      .then(setSettings)
      .catch(() => setSettings({ name: null, logo: null }));
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const siteName = settings?.name ?? DEFAULT_NAME;

  return (
    <nav 
      className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 transition-all duration-300 shadow-sm"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        
        {/* Brand / Logo Section */}
        <div className="flex items-center gap-x-3 flex-shrink-0">
          <a 
            href="/" 
            className="flex items-center gap-x-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg p-1"
            aria-label={`${siteName} Home`}
          >
            <div className="hidden sm:block">
              <div className="font-extrabold text-2xl tracking-tight text-slate-900 leading-none">
                {siteName}
              </div>
              <div className="text-[11px] text-slate-500 font-medium tracking-wide uppercase mt-1">
                {DEFAULT_TAGLINE}
              </div>
            </div>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-x-8">
          {NAV_LINKS.map((link) => {
            const isActive = activePath === link.href;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActivePath(link.href)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative font-medium text-sm transition-colors px-1 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md
                  ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}
                `}
              >
                {link.label}
                {/* Active Indicator Underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full animate-in fade-in zoom-in duration-300" />
                )}
              </a>
            );
          })}
        </div>

        {/* Desktop Actions & Notifications */}
        <div className="hidden md:flex items-center gap-x-5">
          
          {/* Notifications Icon (Example of optional enhancement) */}
          <button 
            className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            aria-label="View notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>

          <div className="w-px h-6 bg-slate-200 hidden lg:block"></div>

          {isLoggedIn ? (
             <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
               <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                 <User size={14} />
               </div>
               <span className="text-sm font-semibold">Profile</span>
             </button>
          ) : (
            <button 
              onClick={() => alert('Login flow opens here')} 
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-2 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md"
            >
              Log in
            </button>
          )}
          
          <button 
            onClick={() => alert('Register flow')} 
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-full transition-all hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
          >
            Register
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        className={`lg:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        id="mobile-menu"
      >
        <div className="px-4 py-6 flex flex-col gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = activePath === link.href;
            return (
              <a 
                key={link.label}
                href={link.href} 
                onClick={() => {
                  setActivePath(link.href);
                  setIsMenuOpen(false); // Auto-close on click
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors
                  ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'}
                `}
              >
                <link.icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                {link.label}
              </a>
            );
          })}
          
          <div className="mt-4 pt-6 border-t border-slate-100 flex flex-col gap-3 px-2">
            <button className="flex items-center justify-center gap-2 py-3.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full font-semibold transition-colors">
              Log in
            </button>
            <button className="flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-colors shadow-md">
              <Briefcase size={18} />
              Register
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;