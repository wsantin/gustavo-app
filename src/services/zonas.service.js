import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

class ZonasService {
  constructor() {
    this.collectionName = 'zonas';
  }

  async createZona(zonaData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const zona = {
        ...zonaData,
        activa: zonaData.activa !== undefined ? zonaData.activa : true,
        fechaCreacion: serverTimestamp(),
        fechaModificacion: serverTimestamp(),
        creadoPor: currentUser.uid
      };

      const docRef = await addDoc(collection(db, this.collectionName), zona);
      
      return {
        success: true,
        id: docRef.id,
        data: { id: docRef.id, ...zona },
        message: 'Zona creada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al crear zona'
      };
    }
  }

  async getZonas() {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('nombre', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const zonas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        data: zonas
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener zonas'
      };
    }
  }

  async getZonasActivas() {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('activa', '==', true),
        orderBy('nombre', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const zonas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        data: zonas
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener zonas activas'
      };
    }
  }

  async updateZona(id, updates) {
    try {
      await updateDoc(doc(db, this.collectionName, id), {
        ...updates,
        fechaModificacion: serverTimestamp()
      });

      return {
        success: true,
        message: 'Zona actualizada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al actualizar zona'
      };
    }
  }

  async getZonaById(id) {
    try {
      const docSnap = await getDoc(doc(db, this.collectionName, id));
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: {
            id: docSnap.id,
            ...docSnap.data()
          }
        };
      } else {
        return {
          success: false,
          error: 'Zona no encontrada'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener zona'
      };
    }
  }

  async deleteZona(id) {
    try {
      // Primero obtener el nombre de la zona para verificar socios
      const zonaDoc = await getDoc(doc(db, this.collectionName, id));
      if (!zonaDoc.exists()) {
        return {
          success: false,
          error: 'Zona no encontrada'
        };
      }

      const zonaNombre = zonaDoc.data().nombre;

      // Verificar si hay personal usando esta zona (por nombre, no por ID)
      const personalSnapshot = await getDocs(
        query(collection(db, 'personal'), where('zona', '==', zonaNombre))
      );

      if (!personalSnapshot.empty) {
        return {
          success: false,
          error: `No se puede eliminar la zona "${zonaNombre}" porque tiene ${personalSnapshot.size} personal(es) asociado(s)`
        };
      }

      await deleteDoc(doc(db, this.collectionName, id));

      return {
        success: true,
        message: 'Zona eliminada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al eliminar zona'
      };
    }
  }

  async getStats() {
    try {
      const zonasSnapshot = await getDocs(collection(db, this.collectionName));
      const personalSnapshot = await getDocs(collection(db, 'Personal'));

      const zonas = zonasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const personal = personalSnapshot.docs.map(doc => doc.data());

      const total = zonas.length;
      const activas = zonas.filter(z => z.activa).length;

      // Contar personal por zona
      const personalPorZona = {};
      personal.forEach(p => {
        if (p.zona) {
          personalPorZona[p.zona] = (personalPorZona[p.zona] || 0) + 1;
        }
      });

      return {
        success: true,
        data: {
          total,
          activas,
          inactivas: total - activas,
          personalPorZona
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener estadísticas'
      };
    }
  }
}

export default new ZonasService();