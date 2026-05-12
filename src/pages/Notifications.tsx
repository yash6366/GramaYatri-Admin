import React, { useState, useEffect } from 'react';
import { Bell, Send, Mail, Smartphone, AlertCircle, Clock, CheckCircle2, X } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { AppNotification, NotificationType } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const NotificationsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement' as NotificationType
  });

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'), 
      orderBy('scheduledFor', 'desc'), 
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q, 
      (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
        setAlerts(list);
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'notifications')
    );

    return unsubscribe;
  }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'notifications'), {
        ...formData,
        scheduledFor: serverTimestamp(),
        sentBy: auth.currentUser?.email || 'System',
        sentAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setFormData({ title: '', message: '', type: 'announcement' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notifications');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Communication Broadcast</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Dispatch system alerts and corridor status updates to the field</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10"
        >
          <Send size={14} />
          Dispatch New Alert
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
           {loading ? (
             <div className="p-20 text-center border border-dashed border-slate-200 rounded-3xl text-slate-400 font-mono text-[10px] uppercase tracking-widest">
               Synchronizing with broadcast nodes...
             </div>
           ) : alerts.length === 0 ? (
             <div className="p-20 text-center border border-dashed border-slate-200 rounded-3xl text-slate-400 font-mono text-[10px] uppercase tracking-widest">
               No active broadcasts in registry
             </div>
           ) : alerts.map((alert, i) => (
             <div key={alert.id || i} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm flex gap-6 group hover:border-blue-200 transition-all">
                <div className={`p-4 rounded-2xl h-fit transition-colors 
                  ${alert.type === 'emergency' ? 'bg-red-50 text-red-500 group-hover:bg-red-100' : 
                    alert.type === 'disruption' ? 'bg-amber-50 text-amber-500 group-hover:bg-amber-100' : 
                    'bg-blue-50 text-blue-500 group-hover:bg-blue-100'}`}>
                   {alert.type === 'emergency' ? <AlertCircle size={24} /> : alert.type === 'disruption' ? <Clock size={24} /> : <Bell size={24} />}
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800">{alert.title}</h4>
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                        {alert.scheduledFor?.seconds 
                          ? formatDistanceToNow(new Date(alert.scheduledFor.seconds * 1000), { addSuffix: true })
                          : 'Just now'}
                      </span>
                   </div>
                   <p className="text-sm text-slate-500 mt-1 leading-relaxed">{alert.message}</p>
                   <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase">
                         <Smartphone size={12} />
                         Origin: {alert.sentBy}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase">
                         <Mail size={12} />
                         Triggered: MANUAL_OVERRIDE
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden h-fit">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bell size={120} />
           </div>
           <div className="relative z-10 space-y-6">
              <div>
                 <h3 className="text-xl font-bold tracking-tight">Channel Analytics</h3>
                 <p className="text-xs text-slate-400 mt-2 font-medium">Broadcast performance over last 24h period</p>
              </div>
              
              <div className="space-y-4">
                 {[
                    { label: "Notification Latency", value: "1.2s" },
                    { label: "Engagement Rate", value: "48%" },
                    { label: "Delivery Success", value: "99.8%" }
                 ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/10 pb-3">
                       <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">{stat.label}</span>
                       <span className="text-sm font-bold font-mono tracking-tighter">{stat.value}</span>
                    </div>
                 ))}
              </div>
              
              <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all backdrop-blur-sm border border-white/5">
                 Configure Webhooks
              </button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 w-full max-w-lg shadow-2xl rounded-3xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Broadcast Dispatch</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleDispatch} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1 font-mono">Alert Type</label>
                    <select 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none bg-white font-bold text-slate-700"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as NotificationType })}
                    >
                      <option value="announcement">ANNOUNCEMENT</option>
                      <option value="disruption">DISRUPTION</option>
                      <option value="emergency">EMERGENCY</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1 font-mono">Alert Title</label>
                    <input 
                      required
                      type="text" 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                      placeholder="e.g. System Maintenance"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1 font-mono">Message Payload</label>
                    <textarea 
                      required
                      rows={4}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none"
                      placeholder="Describe the alert in detail..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 border border-slate-200 rounded-xl text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:bg-slate-50 transition-all font-mono"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 font-mono"
                  >
                    Transmit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPage;

