# 👥 Sistema de Gestión de Personal

Una aplicación web moderna para la gestión integral del personal, desarrollada con React y Firebase.

## 🚀 Características Principales

- **Gestión de Personal**: CRUD completo con datos estructurados (DNI, nombres, apellidos, celular, zona)
- **Gestión de Zonas**: Organización territorial del personal
- **Gestión de Campañas**: Administración de campañas y asignación de personal
- **Dashboard Interactivo**: Estadísticas en tiempo real y visualización de datos
- **Autenticación Segura**: Sistema de login con Firebase Authentication
- **Interfaz Moderna**: Diseño responsive con Material-UI
- **Tiempo Real**: Sincronización automática con Firebase Firestore

## 📋 Estructura de Datos del Personal

Cada registro de personal contiene:

- **DNI**: Documento Nacional de Identidad (campo único y requerido)
- **Nombres**: Nombre(s) de la persona
- **Apellidos**: Apellido(s) de la persona  
- **Celular**: Número de teléfono móvil
- **Zona**: Área geográfica o zona de trabajo asignada

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, Material-UI, React Router
- **Backend**: Firebase (Authentication, Firestore Database)
- **Formularios**: React Hook Form + Yup validation
- **Iconos**: Material-UI Icons
- **Fechas**: Date-fns
- **Deploy**: GitHub Pages

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── common/         # Componentes comunes
│   ├── forms/          # Componentes de formularios
│   └── layout/         # Layout principal
├── pages/              # Páginas principales
│   ├── auth/           # Páginas de autenticación
│   ├── dashboard/      # Dashboard principal
│   ├── personal/       # Gestión de personal (antigua socios/)
│   ├── zonas/          # Gestión de zonas
│   └── campanas/       # Gestión de campañas
├── services/           # Servicios de Firebase
├── store/              # Context API para estado global
├── styles/             # Temas y estilos
└── utils/              # Utilidades y validadores
```

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/wsantin/crud-app.git
cd crud-app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Firebase
Crear archivo `.env.local` en la raíz del proyecto:

```env
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=tu_app_id
```

### 4. Configurar Firestore Security Rules
Ver archivo `FIRESTORE_RULES_OPTIMIZED.md` para reglas de seguridad recomendadas.

## 🚀 Scripts Disponibles

### `npm start`
Ejecuta la aplicación en modo desarrollo.
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### `npm run build`
Construye la aplicación para producción en la carpeta `build`.

### `npm run deploy`
Despliega la aplicación en GitHub Pages.

### `npm test`
Ejecuta los tests en modo interactivo.

## 🔐 Autenticación y Roles

El sistema maneja diferentes niveles de acceso:

- **Usuarios**: Pueden ver y gestionar personal asignado
- **Administradores**: Acceso completo al sistema
- **Invitados**: Solo lectura (si está configurado)

## 📊 Funcionalidades

### Gestión de Personal
- ✅ Lista con filtros y búsqueda avanzada
- ✅ Formulario de registro/edición con validación
- ✅ Visualización de detalles
- ✅ Eliminación segura con confirmación
- ✅ Asociación con zonas y campañas

### Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Personal reciente registrado
- ✅ Gráficos de distribución
- ✅ Acciones rápidas

### Zonas y Campañas
- ✅ CRUD completo
- ✅ Asignación de personal
- ✅ Estadísticas de ocupación

## 🌐 URLs y Navegación

- `/dashboard` - Panel principal
- `/personal` - Lista de personal
- `/personal/nuevo` - Registrar nuevo personal
- `/personal/editar/:id` - Editar personal existente
- `/personal/ver/:id` - Ver detalles del personal
- `/zonas` - Gestión de zonas
- `/campanas` - Gestión de campañas

## 🔧 Desarrollo y Contribución

### Comandos útiles para desarrollo:
```bash
# Modo desarrollo con hot reload
npm start

# Linting y formateo
npm run lint

# Build de producción
npm run build
```

### Estructura de commits:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de errores
- `docs:` Documentación
- `style:` Cambios de formato
- `refactor:` Refactorización de código

## 📱 Deploy en GitHub Pages

La aplicación está configurada para deployment automático:

1. Hacer push a la rama main
2. Ejecutar `npm run deploy`
3. La app estará disponible en: `https://wsantin.github.io/crud-app`

## 🛡️ Seguridad

- Autenticación obligatoria para todas las operaciones
- Validación de datos en cliente y servidor
- Reglas de seguridad Firestore configuradas
- Encriptación en tránsito y en reposo (Firebase)

## 📞 Soporte

Para reportar bugs o solicitar funcionalidades:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo LICENSE para más detalles.

---

## 🔄 Changelog Reciente

### v1.2.0 - Reestructuración de Personal
- ✅ Cambio de "Socios" a "Personal" en toda la aplicación
- ✅ Nuevos campos requeridos: DNI, nombres, apellidos, celular, zona
- ✅ Actualización de rutas: `/personal/*` → `/personal/*`
- ✅ Formulario simplificado y optimizado
- ✅ Validaciones actualizadas

### v1.1.0 - Optimización Firebase
- ✅ Resolución de errores WebChannel transport
- ✅ Implementación de long polling como fallback
- ✅ Reglas de seguridad optimizadas
- ✅ Limpieza de código debug

---

*Desarrollado con ❤️ usando React y Firebase*