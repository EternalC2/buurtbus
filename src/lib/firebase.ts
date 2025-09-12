import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-9319060731-85353",
  "appId": "1:697973473877:web:7415c0fb236f313b270adc",
  "storageBucket": "studio-9319060731-85353.firebasestorage.app",
  "apiKey": "AIzaSyBu7fdGcbMethnT9rG3ezU_Y9rS6mSRSv4",
  "authDomain": "studio-9319060731-85353.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "697973473877"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
