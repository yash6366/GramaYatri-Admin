import React, { useEffect, useState } from 'react';
import { 
  Bus, 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  XCircle,
  MapPin,
  Clock
} from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { Route, RouteStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { exportToCSV } from '../lib/utils';
import { Download } from 'lucide-react';

const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    destination: '',
    status: 'active' as RouteStatus,
    estimatedDuration: 60
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'routes'), 
      (snap) => {
        const routesList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
        setRoutes(routesList);
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'routes')
    );
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoute) {
        await updateDoc(doc(db, 'routes', editingRoute.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'routes'), {
          ...formData,
          id: Math.random().toString(36).substr(2, 9), // Auto ID
          stops: [],
          updatedAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      setEditingRoute(null);
      setFormData({ name: '', origin: '', destination: '', status: 'active', estimatedDuration: 60 });
    } catch (error) {
      handleFirestoreError(error, editingRoute ? OperationType.UPDATE : OperationType.CREATE, editingRoute ? `routes/${editingRoute.id}` : 'routes');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteDoc(doc(db, 'routes', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `routes/${id}`);
      }
    }
  };

  const filteredRoutes = routes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Route Management</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Define and monitor transit corridors across regions</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => exportToCSV(routes, 'grama-yatri-routes')}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={14} />
            Export Data
          </button>
          <button 
            onClick={() => { setEditingRoute(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
          >
            <Plus size={16} />
            Add New Route
          </button>
        </div>
      </header>

      <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
        <div className="p-3.5 text-slate-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Filter routes by name, origin or destination terminal..."
          className="flex-1 py-3 text-sm focus:outline-none placeholder:text-slate-400 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-6">Status</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identification</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connectors</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Efficiency</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-6">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredRoutes.map((route) => (
                  <motion.tr 
                    key={route.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="p-4 pl-6">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${route.status === 'active' ? 'text-green-600 bg-green-100/50' : 'text-slate-400 bg-slate-100/50'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${route.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
                        {route.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Bus size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{route.name}</div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">UID-{route.id.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-bold text-slate-700">{route.origin}</span>
                        <div className="h-[1px] w-4 bg-slate-200" />
                        <span className="font-bold text-slate-700">{route.destination}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                         <MapPin size={10} className="text-slate-300" />
                         <span className="text-[10px] font-mono text-slate-400">{route.stops?.length || 0} Registered Stops</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600">
                          <Clock size={12} className="text-slate-300" />
                          {route.estimatedDuration}m
                        </div>
                        <div className="w-16 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                           <div className="bg-blue-400 h-full w-4/5" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => {
                            setEditingRoute(route);
                            setFormData({ 
                              name: route.name, 
                              origin: route.origin, 
                              destination: route.destination, 
                              status: route.status, 
                              estimatedDuration: route.estimatedDuration 
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(route.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredRoutes.length === 0 && !loading && (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <div className="p-4 bg-slate-50 rounded-full text-slate-300">
              <Bus size={32} />
            </div>
            <div>
              <p className="text-slate-500 font-bold text-sm">No Matching Routes</p>
              <p className="text-slate-400 text-xs mt-1">Refine your search or clear filters to view data.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-slate-200 w-full max-w-lg shadow-2xl rounded-3xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                {editingRoute ? 'Configuration Edit' : 'Registry Entry'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1 font-mono">Terminal Identification</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Rural Express - Zone 4"
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1 font-mono">Origin Point</label>
                    <input 
                      required
                      type="text" 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1 font-mono">Target Destination</label>
                    <input 
                      required
                      type="text" 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1 font-mono">Est. Duration (Min)</label>
                    <input 
                      required
                      type="number" 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono font-bold"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1 font-mono">Status Toggle</label>
                    <select 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none bg-white font-bold text-slate-700"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as RouteStatus })}
                    >
                      <option value="active">OPERATIONAL</option>
                      <option value="inactive">DEACTIVATED</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 border border-slate-200 rounded-xl text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:bg-slate-50 transition-all font-mono"
                >
                  Terminate
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 font-mono"
                >
                  {editingRoute ? 'Commit Changes' : 'Initialize Route'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
