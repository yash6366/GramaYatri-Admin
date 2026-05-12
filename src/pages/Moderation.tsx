import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  User as UserIcon, 
  Clock, 
  Check, 
  X, 
  AlertTriangle,
  History,
  Filter
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { BusReport } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const ModerationPage: React.FC = () => {
  const [reports, setReports] = useState<BusReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    let q = query(collection(db, 'bus_reports'), orderBy('timestamp', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(
      q, 
      (snap) => {
        const reportsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusReport));
        setReports(reportsList);
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'bus_reports')
    );
    return unsubscribe;
  }, []);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected' | 'spam') => {
    try {
      await updateDoc(doc(db, 'bus_reports', id), { status });
      
      // If approved, update the latest_reports collection for that route
      if (status === 'approved') {
        const report = reports.find(r => r.id === id);
        if (report) {
          await updateDoc(doc(db, 'latest_reports', report.routeId), {
            ...report,
            status: 'approved',
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bus_reports/${id}`);
    }
  };

  const filteredReports = reports.filter(r => filter === 'all' || r.status === 'pending');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Moderation Desk</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Verify community-powered transit telemetry in real-time</p>
        </div>
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          <button 
            onClick={() => setFilter('pending')}
            className={`px-5 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${filter === 'pending' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`px-5 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            History
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredReports.map((report) => (
            <motion.div 
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-8 shadow-sm group hover:border-blue-200 transition-all"
            >
              {/* Report Header & User info */}
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-slate-100 font-bold uppercase ring-4 ring-slate-50">
                      {report.userName?.[0] || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{report.userName}</h4>
                      <p className="text-[10px] uppercase font-mono tracking-tighter text-slate-400">Contributor: ID-{report.userId.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${report.credibilityScore > 80 ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                    CONFIDENCE: {report.credibilityScore}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Route Telemetry</p>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <ShieldCheck size={16} className="text-blue-500" />
                      <span>{report.routeId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1 text-slate-500 italic">
                      <MapPin size={14} className="text-slate-300" />
                      {report.stopId}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Temporal Stamp</p>
                    <div className="flex items-center gap-2 text-sm font-mono text-slate-600">
                      <Clock size={16} className="text-slate-300" />
                      {report.timestamp?.seconds 
                        ? format(new Date(report.timestamp.seconds * 1000), 'HH:mm:ss · dd MMM') 
                        : 'Just now'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col justify-end gap-2 shrink-0 md:border-l md:border-slate-100 md:pl-8">
                {report.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(report.id!, 'approved')}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/10"
                    >
                      <Check size={16} />
                      Verify Data
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(report.id!, 'rejected')}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      <X size={16} />
                      Discard
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(report.id!, 'spam')}
                      className="flex items-center justify-center p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Flag as Bot/Spam"
                    >
                      <AlertTriangle size={18} />
                    </button>
                  </>
                ) : (
                  <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl border ${report.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                    <History size={14} />
                    Status: {report.status}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredReports.length === 0 && !loading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-20 text-center flex flex-col items-center justify-center space-y-4 shadow-inner bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
            <div className="p-6 bg-white border border-slate-200 rounded-full shadow-lg">
              <ShieldCheck size={48} className="text-slate-300" />
            </div>
            <p className="font-bold text-slate-800 text-xl">The verification queue is clear</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em]">System synced · Waiting for telemetry</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationPage;
