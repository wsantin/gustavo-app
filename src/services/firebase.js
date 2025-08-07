import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';

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
  throw new Error('Firebase configuration missing critical values');
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configuración optimizada para Firestore
const configureFirestore = async () => {
  try {
    // Configurar timeouts y opciones de conexión
    const settings = {
      cacheSizeBytes: 40000000, // 40MB cache
    };
    
    // Implementar estrategia de reconexión
    const handleNetworkError = async () => {
      console.log('🔄 Intentando reconectar Firestore...');
      try {
        await disableNetwork(db);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await enableNetwork(db);
        console.log('✅ Firestore reconectado exitosamente');
      } catch (error) {
        console.error('❌ Error en reconexión:', error);
      }
    };

    // Detectar errores de conexión
    let connectionErrors = 0;
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('WebChannelConnection') || message.includes('transport errored')) {
        connectionErrors++;
        if (connectionErrors <= 3) {
          console.log(`⚠️  Error de conexión detectado (${connectionErrors}/3). Implementando fallback...`);
          setTimeout(handleNetworkError, 1000);
        }
      }
      originalConsoleError.apply(console, args);
    };

  } catch (error) {
    console.error('Error configurando Firestore:', error);
  }
};

// Configurar Firestore al cargar
configureFirestore();

// Funciones utilitarias para manejo de conexión
export const reconnectFirestore = async () => {
  try {
    await disableNetwork(db);
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.error('Error en reconexión manual:', error);
    return false;
  }
};

export const checkFirestoreConnection = async () => {
  try {
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.error('Firestore connection check failed:', error);
    return false;
  }
};

export default app;