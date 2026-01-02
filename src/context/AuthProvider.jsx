import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import * as authUtils from '../utils/auth';

const ADMIN_EMAIL = 'narishkamal88@gmail.com';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('guest');

  // Signup
  // Supports both Firebase and local fallback
  // Signature: signup(email, password, confirmPassword, displayName?)
  const signup = async (email, password, confirmPassword, displayName) => {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }

    // Local fallback path (requires confirmPassword)
    if (!auth) {
      return authUtils.registerUser(email, password, confirmPassword);
    }

    // Firebase path: create user and optionally set displayName
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const finalDisplayName = displayName || (email ? email.split('@')[0] : undefined);
    const avatar = `https://ui-avatars.com/api/?name=${finalDisplayName}&background=dc3545&color=fff`;

    if (finalDisplayName) {
      try {
        await updateProfile(userCredential.user, {
          displayName: finalDisplayName,
          photoURL: avatar
        });
      } catch (e) {
        console.warn('updateProfile failed', e);
      }
    }

    // Map to plain object for local use
    const u = userCredential.user;
    const user = {
      id: u.uid,
      email: u.email,
      name: u.displayName || finalDisplayName || (u.email ? u.email.split('@')[0] : 'User'),
      avatar: u.photoURL || avatar,
      role: u.email === ADMIN_EMAIL ? 'admin' : 'user',
      joinedDate: new Date().toISOString()
    };
    // Keep a local copy for non-Firebase consumers
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    setCurrentUser(user);
    setUserRole(user.role);
    return userCredential;
  };

  // Login
  const login = async (email, password) => {
    if (auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const u = userCredential.user;
      const username = u.displayName || (u.email ? u.email.split('@')[0] : 'User');
      const user = {
        id: u.uid,
        email: u.email,
        name: username,
        avatar: u.photoURL || `https://ui-avatars.com/api/?name=${username}&background=dc3545&color=fff`,
        role: u.email === ADMIN_EMAIL ? 'admin' : 'user',
        joinedDate: u.metadata.creationTime
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      setCurrentUser(user);
      setUserRole(user.role);
      return userCredential;
    }

    // Local fallback
    return authUtils.loginUser(email, password);
  };

  // Logout
  const logout = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    } else {
      authUtils.logout();
    }
    setCurrentUser(null);
    setUserRole('guest');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
  };

  const isAdmin = () => {
    if (currentUser) return currentUser.email === ADMIN_EMAIL || currentUser.role === 'admin';
    return false;
  };

  const isGuest = () => !isAdmin();

  useEffect(() => {
    // If Firebase auth is available, hook into its state
    if (auth && typeof onAuthStateChanged === 'function') {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        if (u) {
          const username = u.displayName || (u.email ? u.email.split('@')[0] : 'User');
          const user = {
            id: u.uid,
            email: u.email,
            name: username,
            avatar: u.photoURL || `https://ui-avatars.com/api/?name=${username}&background=dc3545&color=fff`,
            role: u.email === ADMIN_EMAIL ? 'admin' : 'user',
            joinedDate: u.metadata.creationTime
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('isAuthenticated', 'true');
          setCurrentUser(user);
          setUserRole(user.role);
        } else {
          // fallback to local stored user if any
          const local = authUtils.getCurrentUser();
          setCurrentUser(local);
          setUserRole(local?.role || 'guest');
        }
        setLoading(false);
      });

      return unsubscribe;
    }

    // No Firebase: use local stored user
    const local = authUtils.getCurrentUser();
    setCurrentUser(local);
    setUserRole(local?.role || 'guest');
    setLoading(false);
    return () => {};
  }, []);

  const value = {
    currentUser,
    userRole,
    isAdmin,
    isGuest,
    signup,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
