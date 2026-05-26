import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, type Persistence } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

declare const require: any;

const firebaseConfig = {
  apiKey: 'AIzaSyALOEzxJbAIE1WhSRpawqehqksMpoOPnHM',
  authDomain: 'gymflow-7d764.firebaseapp.com',
  projectId: 'gymflow-7d764',
  storageBucket: 'gymflow-7d764.firebasestorage.app',
  messagingSenderId: '445050648801',
  appId: '1:445050648801:web:bd891d6baf89e73f2b5fa0',
  measurementId: 'G-N5N8KQXTX2',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth() {
  if (Platform.OS === 'web') {
    return getAuth(firebaseApp);
  }

  try {
    const { getReactNativePersistence } = require('firebase/auth') as {
      getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
    };

    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

export const auth = createAuth();

function createFirestore() {
  if (Platform.OS === 'web') {
    return getFirestore(firebaseApp);
  }

  try {
    return initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true,
    });
  } catch {
    return getFirestore(firebaseApp);
  }
}

export const db = createFirestore();
