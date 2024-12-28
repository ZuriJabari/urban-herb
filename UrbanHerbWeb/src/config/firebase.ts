import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Log Firebase configuration (without sensitive values)
const configCheck = {
  apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: !!import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log('Firebase Config Check:', configCheck);

// Log any missing configurations
const missingConfigs = Object.entries(configCheck)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingConfigs.length > 0) {
  console.error('Missing Firebase configurations:', missingConfigs);
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let auth;

try {
  console.log('Initializing Firebase with project ID:', firebaseConfig.projectId);
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
  
  // Get Auth instance
  auth = getAuth(app);
  console.log('Firebase Auth initialized');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  console.error('Firebase config used:', {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? '[HIDDEN]' : undefined
  });
  throw error;
}

export { auth };
export default app;
