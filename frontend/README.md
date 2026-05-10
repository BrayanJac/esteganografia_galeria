# SecureGallery Frontend

Frontend moderno de React con Vite y TypeScript para la galería segura con detección de esteganografía.

## 🚀 Características

- ⚡ **Vite** - Bundler ultra rápido
- ⚛️ **React 18** - Librería de UI moderna
- 📘 **TypeScript** - Type safety completo
- 🎨 **Tailwind CSS** - Estilos utilitarios
- 🔐 **Autenticación JWT** - Sistema seguro de login
- 🔄 **React Query** - Gestión de estado del servidor
- 🎯 **React Router** - Enrutamiento moderno
- 📦 **Zustand** - Gestión de estado global ligera

## 📋 Requisitos Previos

- Node.js 16+
- npm o yarn
- Backend corriendo en `http://localhost:8000`

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
cd frontend
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` si necesitas cambiar la URL del API:
```env
VITE_API_URL=http://localhost:8000/api
```

## 💻 Comandos Disponibles

### Desarrollo
```bash
npm run dev
```
Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Build para producción
```bash
npm run build
```
Crea la carpeta `dist` con los archivos optimizados.

### Preview del build
```bash
npm run preview
```

### Type checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ProtectedRoute.tsx
│   ├── Navbar.tsx
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── AlbumModal.tsx
├── pages/              # Páginas/rutas principales
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── GalleryPage.tsx
│   └── AdminPage.tsx
├── services/           # Llamadas a API
│   └── api.ts
├── hooks/              # Custom hooks
│   ├── useAuth.ts
│   └── useGallery.ts
├── store/              # Zustand stores
│   └── authStore.ts
├── types/              # TypeScript interfaces
│   └── index.ts
├── utils/              # Utilidades
├── App.tsx             # Componente raíz
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales
```

## 🔐 Autenticación

El frontend maneja la autenticación mediante:
- **JWT tokens** almacenados en localStorage
- **Interceptores Axios** que adjuntan automáticamente el token
- **Routes protegidas** que requieren autenticación
- **Roles** para acceso basado en permisos (user, supervisor, admin)

## 🔗 Integración con Backend

El frontend se comunica con el backend FastAPI mediante:

```
POST   /api/auth/register      - Registrar usuario
POST   /api/auth/login         - Iniciar sesión
GET    /api/auth/me            - Obtener usuario actual

GET    /api/albums             - Listar álbumes del usuario
POST   /api/albums             - Crear álbum
PUT    /api/albums/{id}        - Actualizar álbum
DELETE /api/albums/{id}        - Eliminar álbum

POST   /api/images/upload      - Subir imagen
GET    /api/images             - Listar imágenes
DELETE /api/images/{id}        - Eliminar imagen

GET    /api/gallery            - Galería pública
GET    /api/gallery/{id}       - Imágenes de álbum público

GET    /api/admin/stats        - Estadísticas administrativas
GET    /api/admin/users        - Lista de usuarios
GET    /api/admin/albums       - Lista de álbumes
GET    /api/admin/events       - Eventos de seguridad
GET    /api/admin/users/{id}/activity - Actividad del usuario
PUT    /api/images/{id}/comment - Guardar comentario de imagen
```

---

## ✨ Cambios Recientes (Mayo 2026)

### 📊 Panel Administrativo "Estado" - Totalmente Interactivo
Se ha implementado un panel administrativo completo con capacidad de **drill-down interactivo**:

**Ubicación**: `pages/StatusPage.tsx`

**Características**:
- 🎯 **Tiles Clickables**: Usuarios, Supervisores, Ingresos (LOGIN), Salidas (LOGOUT), Álbumes
- 📋 **Modales de Detalle**: Cada tile abre un modal mostrando datos filtrados
- 👥 **Separación por Rol**: Los eventos se separan automáticamente por rol (usuarios, supervisores, admins)
- 📅 **Última Actividad**: Se muestra el último acceso de cada usuario
- 🌍 **Zona Horaria Ecuador**: Todas las fechas se convierten a `America/Guayaquil`

**Componentes**:
- Modal reutilizable para mostrar drill-down data
- Helper `formatDate(iso: string)` para conversión de zona horaria
- Event grouping por rol en el modal de eventos

### ⌨️ Envío Rápido de Comentarios
Se ha mejorado la experiencia en el panel administrativo (AdminPage):

**Funcionalidad**:
- ✅ **Presionar Enter** en campo de comentarios: Envía automáticamente
- ✅ **Shift+Enter**: Permite agregar nuevas líneas
- ✅ Se aplica en: Álbumes pendientes, álbumes revisados, imágenes en cuarentena

**Comportamiento**:
```typescript
onKeyDown={(e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    // Submit comment
  }
}}
```

### 🌍 Corrección de Zona Horaria (Ecuador)
Todas las fechas en la aplicación ahora se muestran correctamente para Ecuador:

**Implementación**: Helper `formatDate()` en varias páginas
```typescript
const formatDate = (iso: string) => {
  return new Date(iso).toLocaleString(undefined, {
    timeZone: 'America/Guayaquil'
  });
};
```

**Áreas Afectadas**:
- 📊 StatusPage: Timestamps de usuarios, supervisores, eventos
- 🛡️ AdminPage: Fechas en todas las pestañas (pendientes, revisados, cuarentena)
- 🏠 HomePage: Rotación de álbumes destacados
- 📷 Gallery/Album Views: Fechas de imágenes y comentarios

### 🎬 Rotación Automática de Galería Pública
La galería pública ahora muestra álbumes destacados con rotación automática:

**Ubicación**: `pages/HomePage.tsx`

**Características**:
- 🔄 Rotación cada 30 segundos (configurable)
- ✨ Transición CSS con fade effect
- 🖼️ Muestra imagen de portada del álbum
- 🎨 Efecto hover con escala y gradiente

**Implementación**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setFeaturedIndex((prev) => (prev + 1) % featured.length);
  }, 30000); // 30 segundos
  return () => clearInterval(interval);
}, [featured.length]);
```

### 📝 Módulos de Servicios Administrativos

**Nuevo**: `src/services/api.ts` métodos adicionales
```typescript
getAdminUsers()                         // GET /admin/users
getAdminAlbums()                        // GET /admin/albums
getAdminEvents(direction?: string)      // GET /admin/events
getAdminUserActivity(userId: number)    // GET /admin/users/{userId}/activity
updateImageComment(imageId, comment)    // PUT /images/{imageId}/comment
```

**Uso en Componentes**:
- Queries de React Query para cacheo automático
- Invalidación de cache después de actualizaciones
- Manejo de errores con feedback al usuario

### 🎨 Componentes Mejorados

**AdminPage.tsx**:
- Tres vistas: Pendientes, Revisados, Cuarentena
- Comentarios con entrada Enter
- Formateo de fechas con timezone Ecuador

**StatusPage.tsx**:
- Modal component para drill-down
- Event grouping por rol
- Timestamps en zona horaria local

---

Los colores se pueden personalizar en `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* colores primarios */ }
    }
  }
}
```

## 📦 Dependencias Principales

- **react** - Librería de UI
- **react-router-dom** - Enrutamiento
- **axios** - Cliente HTTP
- **@tanstack/react-query** - Gestión de estado del servidor
- **zustand** - Gestión de estado global
- **tailwindcss** - Framework CSS
- **lucide-react** - Iconos SVG

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm run build
# Sube la carpeta `dist` a Vercel
```

### Netlify
```bash
npm run build
# Arrastra la carpeta `dist` a Netlify
```

### Servidor estático personalizado
```bash
npm run build
# Sirve la carpeta `dist` con tu servidor web
```

## 🔒 Variables de Entorno de Producción

```env
VITE_API_URL=https://tu-api-produccion.com/api
```

## 📝 Notas de Desarrollo

- Asegúrate que el backend esté corriendo antes de iniciar el frontend
- Los tokens JWT expiran en 30 minutos por defecto
- Las imágenes se analizan automáticamente después de la subida
- El sistema de cuarentena aísla imágenes sospechosas

## 🐛 Troubleshooting

### CORS errors
- Verifica que el backend esté corriendo
- Comprueba que `VITE_API_URL` sea correcto

### Tokens expirando
- La sesión expira automáticamente después de 30 minutos
- El usuario será redirigido a login

### Images no se cargan
- Asegúrate que el backend tenga acceso a la carpeta `uploads`
- Verifica que la URL de la imagen sea correcta

## 📚 Referencias

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

## 📄 Licencia

MIT
