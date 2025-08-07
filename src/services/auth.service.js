import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';

class AuthService {
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: displayName
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: 'user',
        createdAt: serverTimestamp(),
        isActive: true
      });

      return {
        success: true,
        user: user
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar/crear documento de usuario
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email,
            role: 'admin',
            createdAt: serverTimestamp(),
            isActive: true
          });
        }
      } catch (firestoreError) {
        // Continuar con el login aunque Firestore falle
        console.warn('Warning: Could not verify/create user document');
      }

      return {
        success: true,
        user: user
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Se ha enviado un correo para restablecer la contraseña'
      };
    } catch (error) {
      console.error('Error al enviar correo de restablecimiento:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No hay usuario autenticado');
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return {
          success: true,
          data: userDoc.data()
        };
      } else {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return {
        success: false,
        error: 'Error al obtener datos del usuario'
      };
    }
  }

  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
      'auth/invalid-email': 'El correo electrónico no es válido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Por favor, intente más tarde',
      'auth/requires-recent-login': 'Por favor, vuelva a iniciar sesión para realizar esta operación',
      'auth/network-request-failed': 'Error de conexión. Por favor, verifique su conexión a internet'
    };

    return errorMessages[errorCode] || 'Ha ocurrido un error. Por favor, intente nuevamente';
  }
}

export default new AuthService();