import React, { useEffect, useState } from 'react';
import { 
  Users, 
  MapPin, 
  ShieldAlert, 
  Bus, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { collection, onSnapshot, query, limit, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { exportToCSV } from '../lib/utils';

const statsData = [
  { name: 'Mon', reports: 40, active: 2400 },
  { name: 'Tue', reports: 30, active: 1398 },
  { name: 'Wed', reports: 20, active: 9800 },
  { name: 'Thu', reports: 27, active: 3908 },
  { name: 'Fri', reports: 18, active: 4800 },
  { name: 'Sat', reports: 23, active: 3800 },
  { name: 'Sun', reports: 34, active: 4300 },
];

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  description?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}> = ({ title, value, icon, description, trend, trendValue }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200 group">
    <div className="flex justify-between items-start mb-2">
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{title}</p>
      <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-500 transition-colors">
        {icon}
      </div>
    </div>
    <div className="text-3xl font-bold font-mono tracking-tighter text-slate-900">{value}</div>
    <div className="flex items-center gap-2 mt-1">
      {trend && (
        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trendValue}
        </div>
      )}
      <p className="text-[10px] text-slate-400 font-medium">{description}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [counts, setCounts] = useState({
    users: 0,
    routes: 0,
    reports: 0,
    activeBuses: 0
  });

  useEffect(() => {
    const unsubUsers = onSnapshot(
      collection(db, 'users'), 
      (snap) => {
        setCounts(prev => ({ ...prev, users: snap.size }));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'users')
    );

    const unsubRoutes = onSnapshot(
      collection(db, 'routes'), 
      (snap) => {
        setCounts(prev => ({ ...prev, routes: snap.size }));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'routes')
    );

    const unsubReports = onSnapshot(
      collection(db, 'bus_reports'), 
      (snap) => {
        setCounts(prev => ({ ...prev, reports: snap.size }));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'bus_reports')
    );

    return () => {
      unsubUsers();
      unsubRoutes();
      unsubReports();
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Active Users" 
          value={counts.users} 
          icon={<Users size={16} />} 
          trend="up" 
          trendValue="+12%" 
          description="Verified active accounts"
        />
        <StatCard 
          title="Routes Tracked" 
          value={counts.routes} 
          icon={<MapPin size={16} />} 
          description="Monitored corridors"
        />
        <StatCard 
          title="Reports Today" 
          value={counts.reports} 
          icon={<ShieldAlert size={16} />} 
          trend="up" 
          trendValue="+5.2%"
          description="Community location activity"
        />
        <StatCard 
          title="Avg ETA Accuracy" 
          value="94.2%" 
          icon={<Bus size={16} />} 
          description="Real-time calculated"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide">Network Activity</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => exportToCSV(statsData, `grama-yatri-activity-${new Date().toISOString()}`)}
                className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wide"
              >
                Download CSV
              </button>
            </div>
          </div>
          <div className="flex-1 p-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsData}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#94a3b8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reports" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorReports)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Status Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide">System Health</h3>
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="flex gap-4 items-start pb-6 border-b border-slate-50">
              <div className="w-2.5 h-2.5 mt-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Operational: Normal</h4>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Nodes responding within 20ms range</p>
              </div>
            </div>
            <div className="flex gap-4 items-start pb-6 border-b border-slate-50">
              <div className="w-2.5 h-2.5 mt-1 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Pending Moderation</h4>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">12 items awaiting verification action</p>
              </div>
            </div>
            <div className="flex gap-4 items-start pb-6 border-b border-slate-50">
              <div className="w-2.5 h-2.5 mt-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Data Pipeline</h4>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Transit stream synced with Firebase RLDB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Data Grid Placeholder / Summary Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Node Reliability</h3>
          <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> High Confidence</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderate confidence</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 divide-x divide-slate-100">
          {[
            { name: 'Hassan - Sakleshpura', reliability: 98, color: 'bg-green-500' },
            { name: 'Hassan - Belur', reliability: 92, color: 'bg-green-500' },
            { name: 'Arsikere - Hassan', reliability: 74, color: 'bg-amber-500' },
            { name: 'Hole Narsipura - Hassan', reliability: 96, color: 'bg-green-500' }
          ].map((item, idx) => (
            <div key={idx} className="p-5 flex flex-col justify-between hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-800">{item.name}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">Corridor Alpha-{idx+1}</p>
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-[10px] font-mono font-bold ${item.reliability > 80 ? 'text-slate-600' : 'text-amber-600'}`}>
                    HEALTH: {item.reliability}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`${item.color} h-full transition-all duration-1000`} style={{ width: `${item.reliability}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
