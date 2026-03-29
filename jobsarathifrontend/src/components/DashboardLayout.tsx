import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  User as UserIcon
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'company' | 'candidate';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = role === 'company' 
    ? [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/company/dashboard' },
        { icon: Briefcase, label: 'Manage Jobs', path: '/company/jobs' },
        { icon: Users, label: 'Applicants', path: '/company/applicants' },
        { icon: Settings, label: 'Settings', path: '/company/settings' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/candidate/dashboard' },
        { icon: Search, label: 'Find Jobs', path: '/' },
        { icon: Briefcase, label: 'My Applications', path: '/candidate/applications' },
        { icon: UserIcon, label: 'Profile', path: '/profile' },
      ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold text-indigo-600">Job Sarathi</Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 md:hidden">
             <Link to="/" className="text-xl font-bold text-indigo-600">JS</Link>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {role === 'company' ? user?.company_name : `${user?.first_name} ${user?.last_name}`}
                </p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {(user?.company_name?.[0] || user?.first_name?.[0] || 'U').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
