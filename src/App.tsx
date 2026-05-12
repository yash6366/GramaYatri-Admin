import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Layout & Pages
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/Routes';
import ModerationPage from './pages/Moderation';
import UserManagement from './pages/UserManagement';
import MapPage from './pages/LiveMap';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';
import ETAManager from './pages/ETA';
import NotificationsPage from './pages/Notifications';
import { LogIn, Bus, Shield } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Bus size={48} className="text-blue-600 animate-pulse" />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Syncing with Grama-Yatri Net...</p>
      </div>
    </div>
  );
  
  if (!user || !isAdmin) return <Navigate to="/login" />;
  
  return <DashboardLayout>{children}</DashboardLayout>;
};

const LoginPage: React.FC = () => {
  const { login, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && isAdmin) navigate('/dashboard');
  }, [user, isAdmin, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-xl shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0">
            GY
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white leading-none">Grama-Yatri</h1>
            <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-slate-500 mt-1.5 ml-0.5">Admin Control Instance</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Security Clearance</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Authenticate via system protocols to access the transit monitoring grid. Restricted to Level 3 personnel.
            </p>
          </div>
          
          <button 
            onClick={login}
            className="w-full h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            <LogIn size={18} />
            Initialize Google Auth
          </button>
          
          {user && !isAdmin && (
            <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 items-start">
              <Shield size={18} className="shrink-0 mt-0.5" />
              <div className="text-xs font-bold font-mono uppercase leading-relaxed">
                Auth_Error: Insufficient clearance level for UID-{user.uid.slice(0, 8).toUpperCase()}. Access Denied.
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex gap-6">
             <div className="flex items-center gap-2 opacity-30">
               <div className="w-2 h-2 rounded-full bg-green-500" />
               <span className="text-[10px] font-mono text-white uppercase tracking-widest">Protocol.V2</span>
             </div>
             <div className="flex items-center gap-2 opacity-30">
               <div className="w-2 h-2 rounded-full bg-blue-500" />
               <span className="text-[10px] font-mono text-white uppercase tracking-widest">Encrypted.Tls</span>
             </div>
          </div>
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Grama-Yatri Net · Transit Ops
          </p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Live Pages */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/routes" element={<ProtectedRoute><RoutesPage /></ProtectedRoute>} />
          <Route path="/moderation" element={<ProtectedRoute><ModerationPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/eta" element={<ProtectedRoute><ETAManager /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
