// ======================
//  components/User/CandidateNavbar.tsx
// ======================

import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Bell, Briefcase, FileText, Heart, 
  MessageSquare, ChevronDown 
} from 'lucide-react';
import { fetchWebsiteSettings, type WebsiteSettings } from '../../api/websiteSettings';

const DEFAULT_NAME = 'Job Sarathi';

// Candidate-specific navigation links
const CANDIDATE_NAV_LINKS = [
  { label: 'Find Jobs', href: '/jobs', icon: Briefcase },
  { label: 'My Applications', href: '/applications', icon: FileText },
  { label: 'Saved Jobs', href: '/saved-jobs', icon: Heart },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
];

const CandidateNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [activePath, setActivePath] = useState('/jobs'); 
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock user data
  const user = {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    avatar: 'https://i.pravatar.cc/150?u=aarav', // Placeholder avatar
  };

  useEffect(() => {
    fetchWebsiteSettings()
      .then(setSettings)
      .catch(() => setSettings({ name: null, logo: null }));
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const siteName = settings?.name ?? DEFAULT_NAME;

  return (
    <nav 
      className="bg-white/95 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 transition-all duration-300 shadow-sm"
      aria-label="Candidate Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        
        {/* Brand / Logo Section */}
        <div className="flex items-center gap-x-3 flex-shrink-0">
          <a 
            href="/dashboard" 
            className="flex items-center gap-x-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg p-1"
            aria-label={`${siteName} Dashboard`}
          >
            {settings?.logo ? (
              <img 
                src={settings.logo} 
                alt={`${siteName} Logo`} 
                className="w-10 h-10 object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform" 
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl tracking-tighter shadow-md group-hover:scale-105 transition-transform">
                JS
              </div>
            )}
            <div className="hidden sm:block">
              <div className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                {siteName}
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-1">
                Candidate Portal
              </div>
            </div>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-x-6">
          {CANDIDATE_NAV_LINKS.map((link) => {
            const isActive = activePath === link.href;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => { e.preventDefault(); setActivePath(link.href); }}
                aria-current={isActive ? 'page' : undefined}
                className={`relative font-medium text-sm transition-colors px-2 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md
                  ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}
                `}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full animate-in fade-in duration-300" />
                )}
              </a>
            );
          })}
        </div>

        {/* Desktop Actions & Profile Dropdown */}
        <div className="hidden lg:flex items-center gap-x-4">
          
          {/* Notifications */}
          <button 
            className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            aria-label="View notifications"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          </button>

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-x-2 rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full object-cover" 
              />
              <ChevronDown size={16} className={`${isProfileOpen ? 'rotate-180' : ''} transition-transform`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-50 py-1">
                <a href="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600">Profile</a>
                <a href="/settings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600">Settings</a>
                <a href="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700">Logout</a>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-500 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-3 flex flex-col gap-y-1">
            {CANDIDATE_NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => { e.preventDefault(); setActivePath(link.href); setIsMenuOpen(false); }}
                className={`block px-3 py-2 rounded-md font-medium text-sm 
                  ${activePath === link.href ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default CandidateNavbar;