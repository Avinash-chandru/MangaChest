import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAx5T2j_J_yNlsUpPmN2N2EDuLLvlJxsoY",
  authDomain: "mangachest-c2eef.firebaseapp.com",
  projectId: "mangachest-c2eef",
  storageBucket: "mangachest-c2eef.firebasestorage.app",
  messagingSenderId: "449425680308",
  appId: "1:449425680308:web:cd7ac151c147649d6474e1",
  measurementId: "G-P0X1KE79Z3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

try {
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}
export default app;