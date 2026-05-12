import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Allowed admin email from prompt
const BOOTSTRAP_ADMIN_EMAIL = 'yashwanthnaidum2408@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        const userDocRef = doc(db, 'users', fbUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            let userData = userDoc.data() as User;
            // Promote to admin if bootstrap email but wrong role
            if (fbUser.email === BOOTSTRAP_ADMIN_EMAIL && userData.role !== 'admin') {
              userData = { ...userData, role: 'admin' };
              await updateDoc(userDocRef, { role: 'admin' });
            }
            setUser(userData);
          } else {
            // If first time login and it's the bootstrap admin, create admin profile
            const isBootstrapAdmin = fbUser.email === BOOTSTRAP_ADMIN_EMAIL;
            const newUser: User = {
              uid: fbUser.uid,
              name: fbUser.displayName || 'Admin',
              email: fbUser.email || '',
              role: isBootstrapAdmin ? 'admin' : 'user', // Default to user unless bootstrap
              credibilityScore: 100,
              status: 'active',
              reportCount: 0,
            };
            
            await setDoc(userDocRef, {
              ...newUser,
              createdAt: serverTimestamp()
            });
            setUser(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'route_manager';

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
