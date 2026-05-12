import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Route as RouteIcon, 
  ShieldCheck, 
  Users, 
  Bell, 
  BarChart3, 
  Clock, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'motion/react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
      ${isActive 
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
    `}
  >
    <div className="shrink-0 opacity-80">{icon}</div>
    <span>{label}</span>
  </NavLink>
);

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/map', icon: <MapIcon size={18} />, label: 'Live Map' },
    { to: '/routes', icon: <RouteIcon size={18} />, label: 'Routes' },
    { to: '/moderation', icon: <ShieldCheck size={18} />, label: 'Moderation' },
    { to: '/users', icon: <Users size={18} />, label: 'User Mgmt' },
    { to: '/eta', icon: <Clock size={18} />, label: 'ETA Manager' },
    { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { to: '/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
    { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">GY</div>
          <span className="text-xl font-bold tracking-tight">Grama-Yatri</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem key={item.to} {...item} onClick={() => setIsSidebarOpen(false)} />
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-700 rounded-full border-2 border-slate-600 flex items-center justify-center text-xs font-bold uppercase truncate">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-mono mt-1">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              {navItems.find(item => window.location.pathname.includes(item.to))?.label || 'Gramy-Yatri Admin'}
            </h2>
            <div className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider shadow-sm">
              Firebase Live
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs">
              <Clock size={14} />
              <span>Update: <span className="font-mono">{new Date().toLocaleTimeString()}</span></span>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-full relative text-slate-500 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Main Content Scroll Container */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
