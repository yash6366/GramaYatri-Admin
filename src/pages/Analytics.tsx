import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

const AnalyticsPage: React.FC = () => {
  const [reportCount, setReportCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [routeCount, setRouteCount] = useState(0);
  const [pieData, setPieData] = useState<{name: string, value: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubReports = onSnapshot(collection(db, 'bus_reports'), (snap) => {
      setReportCount(snap.size);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'bus_reports'));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUserCount(snap.size);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));

    const unsubRoutes = onSnapshot(collection(db, 'routes'), (snap) => {
      setRouteCount(snap.size);
      
      // Basic grouping for pie chart (e.g. by status or origin)
      const distribution: Record<string, number> = {};
      snap.docs.forEach(doc => {
        const data = doc.data();
        const key = data.origin || 'Unknown Node';
        distribution[key] = (distribution[key] || 0) + 1;
      });
      
      const pie = Object.entries(distribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4);
        
      setPieData(pie);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'routes'));

    return () => {
      unsubReports();
      unsubUsers();
      unsubRoutes();
    };
  }, []);

  const chartData = [
    { name: 'Reports', value: reportCount },
    { name: 'Users', value: userCount },
    { name: 'Routes', value: routeCount },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Intelligence Aggregation</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Advanced transit telemetry analysis and corridor performance metrics</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm">
            <Calendar size={14} />
            Period: Real-time
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10">
            <Download size={14} />
            Generate Report
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Network Utilization</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">System_Active</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
             {loading ? (
               <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                 Streaming data...
               </div>
             ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             )}
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Regional Distribution</h3>
          <div className="flex-1 min-h-[200px]">
            {pieData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                No Geographic Data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-800 ml-3.5">{item.value} Route{item.value !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: <TrendingUp className="text-blue-500" />, label: "Reports Collected", value: reportCount.toString(), desc: "Total telemetry units received" },
          { icon: <Users className="text-green-500" />, label: "Registered Users", value: userCount.toString(), desc: "Contributing network nodes" },
          { icon: <MapPin className="text-amber-500" />, label: "Mapped Corridors", value: routeCount.toString(), desc: "Active transit routes enabled" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm hover:border-blue-200 transition-all group">
            <div className="p-2 bg-slate-50 w-fit rounded-lg mb-4 group-hover:bg-blue-50 transition-colors">
              {stat.icon}
            </div>
            <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono">{stat.label}</h4>
            <div className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">{stat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsPage;

