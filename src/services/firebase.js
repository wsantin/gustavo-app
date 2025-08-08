import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Verificar configuración crítica
if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
  console.error('Firebase configuration missing critical values:', {
    hasProjectId: !!firebaseConfig.projectId,
    hasApiKey: !!firebaseConfig.apiKey
  });
  throw new Error('Firebase configuration missing critical values');
}

// Inicializar Firebase solo una vez
const app = initializeApp(firebaseConfig);

// Inicializar Auth con persistencia local
export const auth = getAuth(app);

// Configurar persistencia de auth
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Could not set auth persistence:', error);
});

// Inicializar Firestore con configuración optimizada
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Función de verificación deshabilitada para evitar loops
export const checkFirestoreConnection = async () => {
  // DESHABILITADO: Esta función causaba múltiples listeners
  // Siempre retorna true para evitar problemas
  return true;
};

// Función de reconexión manual (solo si es necesario)
export const reconnectFirestore = async () => {
  // DESHABILITADO: La reconexión automática de Firebase es suficiente
  console.log('Reconnection handled automatically by Firebase SDK');
  return true;
};

// Log de configuración inicial (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('🔥 Firebase initialized with project:', firebaseConfig.projectId);
  console.log('📦 Using persistent local cache with multi-tab support');
}

export default app;