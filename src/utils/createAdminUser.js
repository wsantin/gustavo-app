// Script para crear un usuario administrador manualmente
// Este archivo puede ser ejecutado desde la consola del navegador o usado como referencia

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export const createAdminUser = async (email, password, displayName) => {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Actualizar el perfil del usuario
    await updateProfile(user, {
      displayName: displayName
    });

    // Crear documento en Firestore con rol de admin
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: 'admin', // Rol de administrador
      createdAt: serverTimestamp(),
      isActive: true
    });

    console.log('Usuario administrador creado exitosamente:', {
      uid: user.uid,
      email: user.email,
      displayName: displayName
    });

    return user;
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
    throw error;
  }
};

// Ejemplo de uso:
// Para crear un usuario administrador, ejecuta esto en la consola del navegador:
// 
// import { createAdminUser } from './utils/createAdminUser';
// createAdminUser('admin@example.com', 'password123', 'Administrador');
//
// O puedes crear un usuario manualmente desde Firebase Console:
// 1. Ve a Firebase Console > Authentication > Users
// 2. Click en "Add user"
// 3. Ingresa email y password
// 4. Después ve a Firestore > users y crea un documento con el UID del usuario