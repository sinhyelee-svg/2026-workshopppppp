import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the database ID provisioned for this applet
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);
