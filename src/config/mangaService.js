import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase.js';
import { mangaData } from '../data/mangaData.js';

const COLLECTION_NAME = 'manga';

export const mangaService = {
  // Create a new manga
  async createManga(mangaPayload) {
    try {
      if (!db) {
        // local fallback: append to local data
        const newItem = { ...mangaPayload, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        mangaData.unshift(newItem);
        return { success: true, data: newItem };
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...mangaPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating manga:', error);
      return { success: false, error: error.message || String(error) };
    }
  },

  // Get all manga
  async getAllManga() {
    try {
      if (!db) return { success: true, data: mangaData };

      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return { success: true, data: list };
    } catch (err) {
      console.error('getAllManga error:', err);
      return { success: false, error: err.message || String(err) };
    }
  },

  // Get manga by id
  async getMangaById(id) {
    try {
      if (!db) {
        const m = mangaData.find(x => String(x.id) === String(id));
        return { success: true, data: m || null };
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return { success: false, error: 'Not found' };
      return { success: true, data: { id: snap.id, ...snap.data() } };
    } catch (err) {
      console.error('getMangaById error:', err);
      return { success: false, error: err.message || String(err) };
    }
  },

  // Get manga by author name (simple text equality)
  async getMangaByAuthor(author) {
    try {
      if (!db) {
        const list = mangaData.filter(m => String(m.author || '').toLowerCase() === String(author || '').toLowerCase());
        return { success: true, data: list };
      }

      const q = query(collection(db, COLLECTION_NAME), where('author', '==', author));
      const snap = await getDocs(q);
      return { success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (err) {
      console.error('getMangaByAuthor error:', err);
      return { success: false, error: err.message || String(err) };
    }
  },

  // Update a manga
  async updateManga(id, updates) {
    try {
      if (!db) {
        const idx = mangaData.findIndex(m => String(m.id) === String(id));
        if (idx === -1) return { success: false, error: 'Not found' };
        mangaData[idx] = { ...mangaData[idx], ...updates, updatedAt: new Date().toISOString() };
        return { success: true, data: mangaData[idx] };
      }

      const ref = doc(db, COLLECTION_NAME, id);
      await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (err) {
      console.error('updateManga error:', err);
      return { success: false, error: err.message || String(err) };
    }
  },

  // Delete a manga
  async deleteManga(id) {
    try {
      if (!db) {
        const before = mangaData.length;
        const filtered = mangaData.filter(m => String(m.id) !== String(id));
        // mutate local array
        mangaData.length = 0;
        mangaData.push(...filtered);
        return { success: true, deleted: before - filtered.length };
      }

      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { success: true };
    } catch (err) {
      console.error('deleteManga error:', err);
      return { success: false, error: err.message || String(err) };
    }
  },

  // Get manga created by a specific user (createdBy field)
  async getMangaByCreator(userId) {
    try {
      if (!db) {
        return { success: true, data: mangaData.filter(m => m.createdBy === userId) };
      }

      const q = query(collection(db, COLLECTION_NAME), where('createdBy', '==', userId));
      const snap = await getDocs(q);
      return { success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (err) {
      console.error('getMangaByCreator error:', err);
      return { success: false, error: err.message || String(err) };
    }
  }
};

export default mangaService;
