// Script para diagnosticar problemas de Firebase
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🔍 Verificando configuración de Firebase...');
  
  // Verificar configuración
  console.log('📋 Configuración Firebase:', {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? '✅ Configurada' : '❌ Faltante',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID ? '✅ Configurada' : '❌ Faltante'
  });

  // Verificar Auth
  console.log('🔐 Estado de Authentication:', {
    currentUser: auth.currentUser ? '✅ Usuario logueado' : '⚠️ Sin usuario',
    userId: auth.currentUser?.uid || 'N/A'
  });

  // Verificar Firestore
  try {
    console.log('🗃️ Probando conexión a Firestore...');
    
    // Intentar leer un documento de prueba
    const testDoc = doc(db, 'test', 'connection');
    const docSnap = await getDoc(testDoc);
    
    if (docSnap.exists()) {
      console.log('✅ Firestore: Documento de prueba existe');
    } else {
      console.log('⚠️ Firestore: Documento de prueba no existe');
    }
  } catch (error) {
    console.error('❌ Error conectando a Firestore:', error);
    
    if (error.code === 'permission-denied') {
      console.log('💡 Solución: Revisar reglas de seguridad en Firebase Console');
    } else if (error.code === 'unavailable') {
      console.log('💡 Solución: Verificar conexión a internet y configuración del proyecto');
    }
  }
};

// Función para crear documento de prueba (solo si tienes permisos)
export const createTestDocument = async () => {
  if (!auth.currentUser) {
    console.log('❌ Necesitas estar logueado para crear documentos');
    return;
  }

  try {
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, {
      message: 'Conexión exitosa',
      timestamp: new Date(),
      user: auth.currentUser.uid
    });
    console.log('✅ Documento de prueba creado exitosamente');
  } catch (error) {
    console.error('❌ Error creando documento de prueba:', error);
  }
};

// Ejecutar diagnóstico al cargar
if (process.env.NODE_ENV === 'development') {
  // Ejecutar después de un delay para que Firebase se inicialice
  setTimeout(testFirebaseConnection, 2000);
}