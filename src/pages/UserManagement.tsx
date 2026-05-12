import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Shield, 
  Ban, 
  Unlock, 
  Award, 
  FileText,
  TrendingDown,
  TrendingUp,
  MoreVertical
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { User, UserRole, UserStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'), 
      (snap) => {
        const usersList = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
        setUsers(usersList);
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'users')
    );
    return unsubscribe;
  }, []);

  const handleStatusToggle = async (uid: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    try {
      await updateDoc(doc(db, 'users', uid), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const handleRoleChange = async (uid: string, role: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Contributor Registry</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Manage collaborative intelligence roles and integrity scores</p>
        </div>
      </header>

      <div className="flex bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
        <div className="p-3.5 text-slate-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Filter entity by name or verified email..."
          className="flex-1 py-3 text-sm focus:outline-none placeholder:text-slate-400 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredUsers.map((user) => (
            <motion.div 
              key={user.uid}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center gap-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200 ${user.status === 'banned' ? 'opacity-50 grayscale bg-slate-50' : ''}`}
            >
              <div className="flex items-center gap-4 min-w-[280px]">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-100 font-bold text-lg shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                  {user.name?.[0] || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{user.name}</h4>
                  <p className="text-[10px] uppercase font-mono tracking-tighter text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 font-mono">Permission Level</p>
                  <select 
                    className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                  >
                    <option value="user">CONTRIBUTOR</option>
                    <option value="moderator">MODERATOR</option>
                    <option value="route_manager">ROUTE_MGR</option>
                    <option value="admin">SUPER_ADMIN</option>
                  </select>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 font-mono">Credibility</p>
                  <div className="flex items-center gap-2">
                    <Award size={14} className={user.credibilityScore > 80 ? 'text-green-500' : 'text-amber-500'} />
                    <span className="text-sm font-mono font-bold text-slate-700">{user.credibilityScore}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 font-mono">Activity Log</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <FileText size={14} className="text-slate-300" />
                    {user.reportCount} Verified Reports
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 font-mono">Authorization</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${user.status === 'active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                    <div className={`w-1 h-1 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {user.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatusToggle(user.uid, user.status)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm
                    ${user.status === 'active' 
                      ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600' 
                      : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/10'}`}
                >
                  {user.status === 'active' ? <Ban size={14} /> : <Unlock size={14} />}
                  {user.status === 'active' ? 'Suspend' : 'Reinstate'}
                </button>
                <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
                  <MoreVertical size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserManagement;
