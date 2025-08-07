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
  limit,
  startAfter,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './firebase';

class SociosService {
  constructor() {
    this.collectionName = 'socios';
  }

  async createSocio(socioData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const socio = {
        ...socioData,
        estado: socioData.estado || 'activo',
        fechaRegistro: socioData.fechaRegistro || serverTimestamp(),
        fechaCreacion: serverTimestamp(),
        fechaModificacion: serverTimestamp(),
        creadoPor: currentUser.uid
      };

      const docRef = await addDoc(collection(db, this.collectionName), socio);
      
      return {
        success: true,
        id: docRef.id,
        message: 'Socio creado exitosamente'
      };
    } catch (error) {
      console.error('Error al crear socio:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  async getSocios(options = {}) {
    try {
      const {
        pageSize = 10,
        lastDoc = null,
        searchTerm = '',
        zona = '',
        campana = '',
        estado = '',
        orderField = 'fechaCreacion',
        orderDirection = 'desc'
      } = options;

      let q = collection(db, this.collectionName);
      const conditions = [];

      // Filtros
      if (zona) conditions.push(where('zona', '==', zona));
      if (campana) conditions.push(where('campana', '==', campana));
      if (estado) conditions.push(where('estado', '==', estado));

      // Aplicar condiciones
      if (conditions.length > 0) {
        q = query(q, ...conditions);
      }

      // Ordenamiento
      q = query(q, orderBy(orderField, orderDirection));

      // Paginación
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(pageSize));

      const snapshot = await getDocs(q);
      const socios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filtro de búsqueda por texto (lado cliente)
      let filteredSocios = socios;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredSocios = socios.filter(socio =>
          (socio.nombres || '').toLowerCase().includes(term) ||
          (socio.apellidos || '').toLowerCase().includes(term) ||
          (socio.celular || '').includes(term)
        );
      }

      return {
        success: true,
        data: filteredSocios,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === pageSize
      };
    } catch (error) {
      console.error('Error al obtener socios:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  async getSocioById(id) {
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
          error: 'Socio no encontrado'
        };
      }
    } catch (error) {
      console.error('Error al obtener socio:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  async updateSocio(id, updates) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const updateData = {
        ...updates,
        fechaModificacion: serverTimestamp(),
        modificadoPor: currentUser.uid
      };

      await updateDoc(doc(db, this.collectionName, id), updateData);

      return {
        success: true,
        message: 'Socio actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error al actualizar socio:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  async deleteSocio(id) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      await deleteDoc(doc(db, this.collectionName, id));

      return {
        success: true,
        message: 'Socio eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error al eliminar socio:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  async getStats() {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));
      const socios = snapshot.docs.map(doc => doc.data());

      const total = socios.length;
      const activos = socios.filter(s => s.estado === 'activo').length;
      
      // Socios del mes actual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const nuevosMes = socios.filter(s => {
        const fechaCreacion = s.fechaCreacion?.toDate?.() || new Date(s.fechaCreacion);
        return fechaCreacion >= startOfMonth;
      }).length;

      // Estadísticas por zona
      const zonaStats = {};
      socios.forEach(socio => {
        if (socio.zona) {
          zonaStats[socio.zona] = (zonaStats[socio.zona] || 0) + 1;
        }
      });

      return {
        success: true,
        data: {
          total,
          activos,
          inactivos: total - activos,
          nuevosMes,
          zonaStats
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  async bulkDelete(ids) {
    try {
      const batch = writeBatch(db);
      
      ids.forEach(id => {
        const docRef = doc(db, this.collectionName, id);
        batch.delete(docRef);
      });

      await batch.commit();

      return {
        success: true,
        message: `${ids.length} socios eliminados exitosamente`
      };
    } catch (error) {
      console.error('Error en eliminación masiva:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  async updateEstado(id, nuevoEstado) {
    return this.updateSocio(id, { estado: nuevoEstado });
  }

  getErrorMessage(error) {
    const errorMessages = {
      'permission-denied': 'No tienes permisos para realizar esta operación',
      'not-found': 'El socio no fue encontrado',
      'unavailable': 'Servicio no disponible. Por favor, intenta más tarde',
      'failed-precondition': 'Error en la operación. Verifica los datos',
      'invalid-argument': 'Datos inválidos proporcionados'
    };

    if (error.code && errorMessages[error.code]) {
      return errorMessages[error.code];
    }

    return error.message || 'Ha ocurrido un error inesperado';
  }
}

export default new SociosService();