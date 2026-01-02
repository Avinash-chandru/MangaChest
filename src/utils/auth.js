import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';

const ADMIN_CREDENTIALS = {
  email: 'narishkamal88@gmail.com',
  password: 'admin123'
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      id: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      avatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.email.split('@')[0]}&background=dc3545&color=fff`,
      role: 'user',
      joinedDate: user.metadata.creationTime
    };

    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');

    return { success: true, user: userData };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const registerUser = async (email, password, confirmPassword, displayName) => {
  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const username = displayName || email.split('@')[0];
    await updateProfile(user, {
      displayName: username,
      photoURL: `https://ui-avatars.com/api/?name=${username}&background=dc3545&color=fff`
    });

    const userData = {
      id: user.uid,
      email: user.email,
      name: username,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=dc3545&color=fff`,
      role: 'user',
      joinedDate: new Date().toISOString()
    };

    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');

    return { success: true, user: userData };
  } catch (error) {
    let message = error.message;
    if (error.code === 'auth/email-already-in-use') {
      message = 'Email is already registered';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    }
    return { success: false, message };
  }
};

export const loginAdmin = (email, password) => {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const adminUser = {
      id: 'admin-001',
      email: ADMIN_CREDENTIALS.email,
      name: 'Admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=ffc107&color=000',
      role: 'admin',
      joinedDate: '2024-01-01'
    };

    localStorage.setItem('currentUser', JSON.stringify(adminUser));
    localStorage.setItem('isAuthenticated', 'true');

    return { success: true, user: adminUser };
  }

  return { success: false, message: 'Invalid admin credentials' };
};

export const logout = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }

  localStorage.removeItem('currentUser');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('readingHistory');
};

export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin' || user?.email === ADMIN_CREDENTIALS.email;
};

export const addToFavorites = (mangaId) => {
  const favorites = getFavorites();
  if (!favorites.includes(mangaId)) {
    favorites.push(mangaId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
};

export const removeFromFavorites = (mangaId) => {
  const favorites = getFavorites();
  const updated = favorites.filter(id => id !== mangaId);
  localStorage.setItem('favorites', JSON.stringify(updated));
};

export const getFavorites = () => {
  const favStr = localStorage.getItem('favorites');
  return favStr ? JSON.parse(favStr) : [];
};

export const isFavorite = (mangaId) => {
  return getFavorites().includes(mangaId);
};

export const addToReadingHistory = (mangaId, chapterId) => {
  const history = getReadingHistory();
  const existingIndex = history.findIndex(
    item => item.mangaId === mangaId && item.chapterId === chapterId
  );

  if (existingIndex !== -1) {
    history[existingIndex].lastRead = new Date().toISOString();
  } else {
    history.unshift({
      mangaId,
      chapterId,
      lastRead: new Date().toISOString()
    });
  }

  localStorage.setItem('readingHistory', JSON.stringify(history.slice(0, 50)));
};

export const getReadingHistory = () => {
  const historyStr = localStorage.getItem('readingHistory');
  return historyStr ? JSON.parse(historyStr) : [];
};

export default {
  loginUser,
  registerUser,
  loginAdmin,
  logout,
  isAuthenticated,
  getCurrentUser,
  isAdmin,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  isFavorite,
  addToReadingHistory,
  getReadingHistory
};
