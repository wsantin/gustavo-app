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
    this.collectionName = 'personal';
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
        message: 'Personal creado exitosamente'
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
        pageSize = 100, // Aumentamos para filtrar del lado cliente
        searchTerm = '',
        zona = '',
        campana = '',
        estado = ''
      } = options;

      console.log('🔍 Buscando personal con filtros:', { searchTerm, zona, campana, estado });

      // Query simple sin índices complejos
      let q = collection(db, this.collectionName);
      
      // Solo ordenar por fecha de creación (sin filtros server-side por ahora)
      q = query(q, orderBy('fechaCreacion', 'desc'), limit(pageSize));

      const snapshot = await getDocs(q);
      let socios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('📊 Total documentos obtenidos:', socios.length);

      // FILTROS DEL LADO CLIENTE (temporal hasta crear índices)
      if (zona && zona !== '') {
        socios = socios.filter(socio => socio.zona === zona);
        console.log('🏢 Filtrados por zona:', socios.length);
      } else if (zona === '') {
        console.log('🏢 Mostrando todas las zonas');
      }

      if (campana) {
        socios = socios.filter(socio => socio.campana === campana);
        console.log('📢 Filtrados por campaña:', socios.length);
      }

      if (estado) {
        socios = socios.filter(socio => socio.estado === estado);
        console.log('📊 Filtrados por estado:', socios.length);
      }

      // Filtro de búsqueda por texto
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        socios = socios.filter(socio =>
          (socio.nombres || '').toLowerCase().includes(term) ||
          (socio.apellidos || '').toLowerCase().includes(term) ||
          (socio.celular || '').includes(term) ||
          (socio.dni || '').includes(term)
        );
        console.log('🔍 Filtrados por búsqueda:', socios.length);
      }

      console.log('✅ Personal encontrado:', socios.length);

      return {
        success: true,
        data: socios,
        total: socios.length
      };
    } catch (error) {
      console.error('❌ Error al obtener personal:', error);
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
          error: 'Personal no encontrado'
        };
      }
    } catch (error) {
      console.error('Error al obtener personal:', error);
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
        message: 'Personal actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error al actualizar personal:', error);
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
        message: 'Personal eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error al eliminar personal:', error);
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