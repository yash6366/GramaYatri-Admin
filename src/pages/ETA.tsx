import React, { useState, useEffect } from 'react';
import { Clock, Calculator, MapPin, ArrowRight, Activity, Zap } from 'lucide-react';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { ETA, Route } from '../types';

const ETAManager: React.FC = () => {
  const [etaData, setEtaData] = useState<ETA[]>([]);
  const [routes, setRoutes] = useState<Record<string, Route>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch ETAs
    const unsubEta = onSnapshot(
      query(collection(db, 'eta'), limit(10)),
      (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ETA));
        setEtaData(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'eta')
    );

    // Fetch Routes to resolve IDs
    const unsubRoutes = onSnapshot(
      collection(db, 'routes'),
      (snap) => {
        const map: Record<string, Route> = {};
        snap.docs.forEach(doc => {
          map[doc.id] = doc.data() as Route;
        });
        setRoutes(map);
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'routes')
    );

    return () => {
      unsubEta();
      unsubRoutes();
    };
  }, []);

  const averageConfidence = etaData.length > 0 
    ? Math.round(etaData.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / etaData.length)
    : 85;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Predictive ETA Engine</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium italic">Monitor algorithmic confidence and real-time temporal deviations across nodes</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Live Algorithmic Confidence</h3>
          </div>
          <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-48 h-48">
               <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#2563eb" 
                    strokeWidth="8" 
                    strokeDasharray="282.7" 
                    strokeDashoffset={282.7 - (282.7 * (averageConfidence / 100))} 
                    strokeLinecap="round" 
                    className="transition-all duration-1000" 
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold font-mono tracking-tighter text-slate-900">{averageConfidence}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Confidence</span>
               </div>
            </div>
            <div className="text-center max-w-xs">
               <p className="text-xs font-medium text-slate-500 leading-relaxed uppercase tracking-tighter">
                 Engines processing live telemetry streams. Variance <span className="text-green-600 font-bold">within operational</span> thresholds.
               </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           {loading ? (
             <div className="p-20 text-center border border-dashed border-slate-200 rounded-3xl text-slate-400 font-mono text-[10px] uppercase tracking-widest">
               Accessing predictive buffers...
             </div>
           ) : etaData.length === 0 ? (
             <div className="p-20 text-center border border-dashed border-slate-200 rounded-3xl text-slate-400 font-mono text-[10px] uppercase tracking-widest">
               No predictive data available in current cycle
             </div>
           ) : etaData.map((eta, i) => {
             const route = routes[eta.routeId];
             return (
               <div key={eta.id || i} className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm hover:border-blue-200 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-xl transition-colors bg-blue-50 text-blue-600 group-hover:bg-blue-100`}>
                        <Activity size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-slate-800">{route?.name || `Route ${eta.routeId}`}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">NODE: {eta.stopId}</span>
                           <div className="w-1 h-1 rounded-full bg-slate-200" />
                           <span className={`text-[10px] font-mono font-bold uppercase ${eta.confidence > 80 ? 'text-green-500' : 'text-amber-500'}`}>
                             {eta.confidence > 80 ? 'OPTIMAL' : 'DEVIATED'}
                           </span>
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="flex items-center gap-2 justify-end">
                        <span className="text-lg font-bold text-slate-800 font-mono tracking-tighter">
                          {eta.estimatedAt?.seconds 
                            ? new Date(eta.estimatedAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : 'TBD'}
                        </span>
                     </div>
                     <p className={`text-[10px] font-bold font-mono mt-0.5 text-blue-500`}>
                        ETA CONFIDENCE: {eta.confidence}%
                     </p>
                  </div>
               </div>
             );
           })}
           
           <button className="w-full py-4 mt-2 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-blue-500/50 hover:text-blue-500 hover:bg-blue-50/50 transition-all">
              <Zap size={14} className="inline mr-2" />
              Recalibrate Predictive Models
           </button>
        </div>
      </div>
    </div>
  );
};

export default ETAManager;

