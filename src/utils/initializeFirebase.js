// Script para inicializar datos en Firebase automáticamente
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';

export const initializeFirebaseData = async () => {
  try {
    console.log('🚀 Inicializando datos de Firebase...');
    
    // Verificar si ya hay datos
    const zonasSnapshot = await getDocs(collection(db, 'zonas'));
    if (zonasSnapshot.size > 0) {
      console.log('✅ Ya existen datos en Firebase');
      return { success: true, message: 'Datos ya existentes' };
    }
    
    console.log('📝 Creando zonas iniciales...');
    // Crear zonas iniciales
    const zonas = [
      { nombre: 'Zona Norte', descripcion: 'Zona norte de la ciudad', activa: true },
      { nombre: 'Zona Sur', descripcion: 'Zona sur de la ciudad', activa: true },
      { nombre: 'Zona Centro', descripcion: 'Zona centro de la ciudad', activa: true },
      { nombre: 'Zona Este', descripcion: 'Zona este de la ciudad', activa: true },
      { nombre: 'Zona Oeste', descripcion: 'Zona oeste de la ciudad', activa: true }
    ];
    
    for (const zona of zonas) {
      await addDoc(collection(db, 'zonas'), {
        ...zona,
        creadoPor: auth.currentUser?.uid || 'sistema',
        fechaCreacion: new Date()
      });
    }
    console.log('✅ Zonas creadas exitosamente');
    
    console.log('📝 Creando campaña inicial...');
    // Crear campaña inicial
    await addDoc(collection(db, 'campanas'), {
      nombre: 'Campaña 2025',
      descripcion: 'Campaña principal del año',
      activa: true,
      fechaInicio: new Date('2025-01-01'),
      fechaFin: new Date('2025-12-31'),
      creadoPor: auth.currentUser?.uid || 'sistema',
      fechaCreacion: new Date()
    });
    console.log('✅ Campaña creada exitosamente');
    
    // Crear documento de usuario si está autenticado
    if (auth.currentUser) {
      console.log('📝 Creando documento de usuario...');
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName || auth.currentUser.email,
        role: 'admin',
        isActive: true,
        createdAt: new Date()
      }, { merge: true }); // merge para no sobrescribir si ya existe
      console.log('✅ Documento de usuario creado/actualizado');
    }
    
    console.log('🎉 Inicialización completada exitosamente');
    return { success: true, message: 'Datos inicializados correctamente' };
    
  } catch (error) {
    console.error('❌ Error inicializando datos:', error);
    return { success: false, error: error.message };
  }
};

// Función para verificar el estado de las colecciones
export const checkCollections = async () => {
  try {
    console.log('🔍 Verificando colecciones...');
    
    const collections = ['zonas', 'campanas', 'personal', 'users'];
    const status = {};
    
    for (const collName of collections) {
      const snapshot = await getDocs(collection(db, collName));
      status[collName] = {
        exists: snapshot.size > 0,
        count: snapshot.size
      };
      console.log(`📊 ${collName}: ${snapshot.size} documentos`);
    }
    
    return status;
  } catch (error) {
    console.error('❌ Error verificando colecciones:', error);
    return null;
  }
};

// Función para limpiar todas las colecciones (usar con cuidado!)
export const clearAllData = async () => {
  if (!window.confirm('⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos?')) {
    return { success: false, message: 'Operación cancelada' };
  }
  
  try {
    console.log('🗑️ Limpiando datos...');
    // Aquí normalmente eliminarías los documentos
    // Por seguridad, solo lo logueamos
    console.log('⚠️ Función de limpieza deshabilitada por seguridad');
    return { success: false, message: 'Función deshabilitada' };
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
    return { success: false, error: error.message };
  }
};

// Hacer disponible en window para llamar desde consola
if (typeof window !== 'undefined') {
  window.initializeFirebase = initializeFirebaseData;
  window.checkFirebaseCollections = checkCollections;
  window.clearFirebaseData = clearAllData;
  
  console.log('🛠️ Comandos disponibles en consola:');
  console.log('  - initializeFirebase() : Inicializar datos');
  console.log('  - checkFirebaseCollections() : Verificar colecciones');
  console.log('  - clearFirebaseData() : Limpiar datos (deshabilitado)');
}