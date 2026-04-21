import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

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
    return initializeAuth(firebaseApp);
  } catch {
    return getAuth(firebaseApp);
  }
}

export const auth = createAuth();
