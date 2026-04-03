import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'company' | 'candidate';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const profilePath = role === 'candidate' ? '/candidate/profile' : '/company/profile';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const menuItems = role === 'company' 
    ? [
        { label: 'Dashboard', path: '/company/dashboard', icon: '📊' },
        { label: 'Manage Jobs', path: '/company/dashboard#manage-jobs', icon: '💼' },
        { label: 'Applicants', path: '/company/dashboard#applicants', icon: '👥' },
        { label: 'Profile', path: '/company/profile', icon: '⚙️' },
      ]
    : [
        { label: 'Dashboard', path: '/candidate/dashboard', icon: '📊' },
        { label: 'Find Jobs', path: '/candidate/dashboard#recommended-jobs', icon: '🔍' },
        { label: 'My Applications', path: '/candidate/dashboard#recent-applications', icon: '📝' },
        { label: 'Profile', path: '/candidate/profile', icon: '👤' },
      ];

  const isActive = (path: string) => {
    const [basePath, hash] = path.split('#');
    if (location.pathname !== basePath) {
      return false;
    }
    if (!hash) {
      return true;
    }
    return location.hash === `#${hash}`;
  };

  const userName = role === 'company' 
    ? user?.company_name 
    : `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';
  
  const userInitial = (user?.first_name?.[0] || user?.company_name?.[0] || 'U').toUpperCase();

  // Theme-aware styles
  const getThemeStyles = () => ({
    background: isDarkMode ? '#0f172a' : '#f3f4f6',
    sidebarBg: isDarkMode ? '#1e293b' : 'white',
    sidebarBorder: isDarkMode ? '#334155' : '#e5e7eb',
    textPrimary: isDarkMode ? '#f1f5f9' : '#1f2937',
    textSecondary: isDarkMode ? '#94a3b8' : '#4b5563',
    headerBg: isDarkMode ? '#1e293b' : 'white',
    headerBorder: isDarkMode ? '#334155' : '#e5e7eb',
    activeBg: isDarkMode ? '#1e3a8a' : '#eff6ff',
    activeColor: isDarkMode ? '#60a5fa' : '#2563eb',
    hoverBg: isDarkMode ? '#334155' : '#f9fafb',
    cardBg: isDarkMode ? '#1e293b' : 'white',
    borderColor: isDarkMode ? '#334155' : '#e5e7eb',
    avatarBg: isDarkMode ? '#334155' : '#e0e7ff',
    avatarColor: isDarkMode ? '#818cf8' : '#4f46e5',
    logoutColor: isDarkMode ? '#f87171' : '#dc2626',
  });

  const theme = getThemeStyles();

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: theme.background,
      transition: 'background-color 0.3s ease'
    }}>
      {/* Sidebar - Desktop */}
      <aside style={{
        width: 260,
        background: theme.sidebarBg,
        borderRight: `1px solid ${theme.sidebarBorder}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 10,
        transition: 'all 0.3s ease'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.borderColor}` }}>
          <Link 
            to={role === 'candidate' ? '/candidate/dashboard' : '/company/dashboard'} 
            style={{ 
              fontSize: 20, 
              fontWeight: 600, 
              color: theme.textPrimary, 
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            JobSarathi
          </Link>
        </div>
        
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleMenuNavigation(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                marginBottom: 4,
                borderRadius: 8,
                background: isActive(item.path) ? theme.activeBg : 'transparent',
                color: isActive(item.path) ? theme.activeColor : theme.textSecondary,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive(item.path) ? 500 : 400,
                width: '100%',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = theme.hoverBg;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: `1px solid ${theme.borderColor}` }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme.logoutColor,
              fontSize: 14,
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#450a0a' : '#fef2f2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{
          height: 64,
          background: theme.headerBg,
          borderBottom: `1px solid ${theme.headerBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 5,
          transition: 'all 0.3s ease'
        }}>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              padding: 8,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: theme.textPrimary
            }}
            className="mobile-menu-btn"
          >
            ☰
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                padding: 8,
                background: 'transparent',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <button style={{
              padding: 8,
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: 18,
              position: 'relative'
            }}>
              🔔
              <span style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                background: '#ef4444',
                borderRadius: '50%'
              }}></span>
            </button>
            
            <div style={{ width: 1, height: 32, background: theme.borderColor }}></div>
            
            <Link
              to={profilePath}
              style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}
            >
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: theme.textPrimary, margin: 0 }}>
                  {userName}
                </p>
                <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0, textTransform: 'capitalize' }}>
                  {role}
                </p>
              </div>
              <div style={{
                width: 40,
                height: 40,
                background: theme.avatarBg,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                color: theme.avatarColor,
                transition: 'all 0.2s ease'
              }}>
                {userInitial}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 15
            }}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 260,
            height: '100vh',
            background: theme.sidebarBg,
            zIndex: 20,
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            transition: 'background 0.3s ease'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.borderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 600, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  JobSarathi
                </span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: theme.textPrimary }}
                >
                  ✕
                </button>
              </div>
            </div>
            <nav style={{ padding: '16px 12px' }}>
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleMenuNavigation(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    marginBottom: 4,
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: theme.textSecondary,
                    fontSize: 14,
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '10px 12px',
                  marginTop: 8,
                  borderRadius: 8,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.logoutColor,
                  fontSize: 14
                }}
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          aside {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
          [style*="margin-left: 260px"] {
            margin-left: 0 !important;
          }
        }
        
        /* Smooth theme transition */
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        
        /* Custom scrollbar for dark mode */
        [data-theme="dark"] ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        [data-theme="dark"] ::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 4px;
        }
        
        [data-theme="dark"] ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        
        [data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;