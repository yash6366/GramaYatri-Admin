import React from 'react';
import { 
  Settings, 
  Shield, 
  Database, 
  Bell, 
  Globe, 
  Cpu, 
  Save,
  RefreshCw
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Configuration</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium italic">Manage instance variables, security protocols, and data pipeline thresholds</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col - Navigation */}
        <div className="space-y-2">
          {[
            { icon: <Cpu size={18} />, label: "Core Parameters", active: true },
            { icon: <Shield size={18} />, label: "Access Control", active: false },
            { icon: <Database size={18} />, label: "Data Retention", active: false },
            { icon: <Bell size={18} />, label: "Alert Buffers", active: false },
            { icon: <Globe size={18} />, label: "Edge Config", active: false },
          ].map((item, idx) => (
            <button 
              key={idx}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                ${item.active 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-800 underline-offset-4'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Col - Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Infrastructure Environment</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">Instance: production-india-south-1</p>
              </div>
              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Telemetry Buffers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Max Report TTL (Hours)</label>
                    <input type="number" defaultValue={24} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Bot Detection Sensitivity</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all">
                      <option>AGGRESSIVE</option>
                      <option selected>BALANCED</option>
                      <option>PERMISSIVE</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Security Layers</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Enforce Multi-Factor</p>
                      <p className="text-[11px] text-slate-500 font-medium">Require verified credentials for all moderator actions</p>
                    </div>
                    <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Auto-Suspend Nodes</p>
                      <p className="text-[11px] text-slate-500 font-medium">Automatically flag routes with 0 reports for {'>'} 72h</p>
                    </div>
                    <div className="w-10 h-6 bg-slate-300 rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20">
                <Save size={14} />
                Overwrite System Config
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
