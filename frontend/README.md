# SecureGallery Frontend

Interfaz moderna de React para galería segura con detección de esteganografía.

## Características

- **Vite** - Bundler ultra rápido con hot module replacement  
- **React 18** - Interfaz moderna y reactiva  
- **TypeScript** - Type safety completo  
- **Tailwind CSS** - Estilos utilitarios responsivos  
- **JWT Authentication** - Sistema seguro de autenticación  
- **React Query** - Gestión de estado del servidor  
- **React Router** - Enrutamiento moderna  
- **Zustand** - State management ligero  
- **Vite Proxy** - Desarrollo sin problemas CORS  

## Requisitos

- Node.js 18+
- npm 9+ o yarn
- Backend corriendo en `http://localhost:8000`

## Instalación

### 1. Clonar y Navegar
```bash
git clone https://github.com/BrayanJac/esteganografia_galeria.git
cd esteganografia_galeria/frontend
```

### 2. Instalar Dependencias
```bash
npm install
# o con yarn
yarn install
```

### 3. Configurar Variables de Entorno
```bash
cp .env.example .env
```

Editar `.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

✅ Frontend disponible en `http://localhost:5173`

## Comandos Disponibles

### Desarrollo
```bash
npm run dev          # Inicia servidor con hot reload
```

### Build
```bash
npm run build        # Genera dist/ optimizado
npm run preview      # Previsualiza build
```

### Verificación de Código
```bash
npm run type-check   # TypeScript type checking
npm run lint         # ESLint checking
```

### Build de Producción
```bash
npm run build
# Deploy el contenido de dist/
```

## 📁 Estructura del Proyecto

```
src/
├── components/                 # 🧩 Componentes reutilizables
│   ├── Navbar.tsx             # Navegación principal
│   ├── LoginForm.tsx          # Formulario login
│   ├── RegisterForm.tsx       # Formulario registro
│   ├── ProtectedRoute.tsx     # Rutas protegidas
│   ├── GuestRoute.tsx         # Rutas invitado
│   ├── AlbumModal.tsx         # Modal crear/editar álbum
│   ├── AlbumDetailsModal.tsx  # Detalles álbum
│   ├── AlbumEditModal.tsx     # Editar álbum
│   ├── ImageLightbox.tsx      # Visor de imágenes
│   ├── ConfirmDialog.tsx      # Diálogo confirmación
│   └── UploadProgressDialog.tsx # Progreso upload
│
├── pages/                      # 📄 Páginas/rutas principales
│   ├── HomePage.tsx           # Página inicio
│   ├── LoginPage.tsx          # Página login
│   ├── RegisterPage.tsx       # Página registro
│   ├── GalleryPage.tsx        # Galería con álbumes
│   ├── AlbumDetailPage.tsx    # Detalles álbum
│   ├── AdminPage.tsx          # Panel admin principal
│   ├── UsersPage.tsx          # Gestión usuarios
│   └── StatusPage.tsx         # Dashboard estadísticas
│
├── services/                   # Cliente HTTP
│   └── api.ts                 # Axios + interceptores JWT
│
├── hooks/                      # 🪝 Custom React Hooks
│   ├── useAuth.ts             # Autenticación
│   ├── useGallery.ts          # Galerías e imágenes
│   └── useUser.ts             # Gestión usuario
│
├── store/                      # State Management (Zustand)
│   └── authStore.ts           # Estado de autenticación
│
├── types/                      # TypeScript Types
│   └── index.ts               # Interfaces compartidas
│
├── utils/                      # Utilidades
│   └── helpers.ts             # Funciones auxiliares
│
├── App.tsx                     # 🌳 Componente raíz
├── main.tsx                    # Punto de entrada
└── index.css                   # Estilos globales
```

## Autenticación

El frontend implementa autenticación JWT:

### Flujo de Autenticación
```
1. Usuario registra/login
   ↓
2. Backend retorna JWT token
   ↓
3. Frontend almacena token en localStorage
   ↓
4. Axios interceptor adjunta token a headers
   ↓
5. Cada petición incluye: Authorization: Bearer <token>
   ↓
6. Si token inválido → 401 → redirige a /login
```

### Token Storage
```typescript
// localStorage
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Rutas Protegidas
```typescript
// Solo usuarios autenticados
<ProtectedRoute path="/gallery" element={<GalleryPage />} />

// Solo invitados (login, register)
<GuestRoute path="/login" element={<LoginPage />} />
```

## Integración Backend

Configuración en `src/services/api.ts`:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
});

// Interceptor JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Endpoints Consumidos

**Autenticación:**
```
POST   /auth/register         # Registrar usuario
POST   /auth/login            # Iniciar sesión
GET    /auth/me               # Usuario actual
POST   /auth/logout           # Cerrar sesión
```

**Álbumes:**
```
GET    /albums/library        # Mis álbumes
POST   /albums/               # Crear álbum
PUT    /albums/{id}           # Actualizar álbum
DELETE /albums/{id}           # Eliminar álbum
GET    /albums/{id}           # Detalles álbum
```

**Imágenes:**
```
POST   /images/upload         # 📤 Subir imagen
GET    /images                # Listar imágenes
DELETE /images/{id}           # Eliminar imagen
GET    /images/quarantined    # Imágenes cuarentenadas
POST   /images/{id}/review    # Revisar imagen
```

**Galería Pública:**
```
GET    /gallery               # Galerías públicas
GET    /gallery/{id}          # Imágenes galería pública
```

## Temas y Estilos

### Tailwind CSS
```
- Diseño responsivo (mobile-first)
- Colores personalizados
- Componentes reutilizables
- Dark mode (opcional)
```

### Modo Oscuro (Futuro)
```typescript
// Próximamente será configurable
// Documentación en: tailwindcss.com/docs/dark-mode
```

## Dependencias Principales

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.8.0",
    "zustand": "^4.4.0",
    "lucide-react": "^0.294.0",
    "@headlessui/react": "^1.7.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^8.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## Build para Producción

### Compilar
```bash
npm run build
```

Genera carpeta `dist/` con:
- ✅ JavaScript minificado
- ✅ CSS optimizado
- ✅ Assets comprimidos
- ✅ Sourcemaps (opcional)

### Servir en Producción
```bash
npm run preview           # Previsualiza localmente
# O deployment en servidor web (nginx, Apache, etc)
```

## Desarrollo

### Hot Module Replacement (HMR)
Vite proporciona reload automático:
```bash
npm run dev

# Cambios en src/ se reflejan instantáneamente
# Sin perder estado de componentes
```

### Debugging
```bash
# Chrome DevTools
# React DevTools extension
# Network tab para ver requests API
```

### Proxy en Desarrollo
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true
  }
}
```

## 📖 Páginas Principales

### HomePage (`/`)
- Presentación del proyecto
- Link a login/registro
- Información sobre esteganografía

### LoginPage (`/login`)
- Formulario de autenticación
- Validación de datos
- Manejo de errores

### GalleryPage (`/gallery`)
- Lista de álbumes del usuario
- Crear nuevo álbum
- Ver imágenes por álbum
- Indicador esteganografía

### AdminPage (`/admin`)
- Dashboard estadísticas
- Vista drill-down interactiva
- Gestión de usuarios (admin)
- Logs de seguridad

### StatusPage (`/status`)
- Estadísticas en tiempo real
- Gráficos de actividad
- Análisis de seguridad

## State Management

### Zustand Auth Store
```typescript
// store/authStore.ts
interface AuthStore {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}
```

### React Query Hooks
```typescript
// hooks/useGallery.ts
useQuery(['albums'], fetchAlbums)
useMutation(createAlbum)
useUploadImage()
```

## 🧪 Testing (Futuro)

```bash
npm run test          # Ejecutar tests
npm run coverage      # Cobertura de tests
```

## 📝 Environment Variables

```env
# .env.development
VITE_API_URL=http://localhost:8000/api
VITE_DEBUG=true

# .env.production
VITE_API_URL=https://api.tudominio.com
VITE_DEBUG=false
```

## 🐛 Troubleshooting

### CORS Error
```
Solución: Verificar que backend esté corriendo en 8000
          y que ALLOWED_ORIGINS incluya 5173
```

### API No Responde
```
Solución: 
  1. Verificar backend está activo: curl localhost:8000/health
  2. Verificar VITE_API_URL en .env
  3. Revisar Network tab en DevTools
```

### Token Expirado
```
Comportamiento: Redirige a /login automáticamente
El interceptor detecta 401 y limpia token
```

## Recursos

- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [Tailwind Docs](https://tailwindcss.com/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Axios Docs](https://axios-http.com/)

---

**Última actualización:** Mayo 2026
├── App.tsx             # Componente raíz
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales
```

## Autenticación

El frontend maneja la autenticación mediante:
- **JWT tokens** almacenados en localStorage
- **Interceptores Axios** que adjuntan automáticamente el token
- **Routes protegidas** que requieren autenticación
- **Roles** para acceso basado en permisos (user, supervisor, admin)

## Integración con Backend

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

### Panel Administrativo "Estado" - Totalmente Interactivo
Se ha implementado un panel administrativo completo con capacidad de **drill-down interactivo**:

**Ubicación**: `pages/StatusPage.tsx`

**Características**:
- **Tiles Clickables**: Usuarios, Supervisores, Ingresos (LOGIN), Salidas (LOGOUT), Álbumes
- 📋 **Modales de Detalle**: Cada tile abre un modal mostrando datos filtrados
- **Separación por Rol**: Los eventos se separan automáticamente por rol (usuarios, supervisores, admins)
- 📅 **Última Actividad**: Se muestra el último acceso de cada usuario
- 🌍 **Zona Horaria Ecuador**: Todas las fechas se convierten a `America/Guayaquil`

**Componentes**:
- Modal reutilizable para mostrar drill-down data
- Helper `formatDate(iso: string)` para conversión de zona horaria
- Event grouping por rol en el modal de eventos

### Envío Rápido de Comentarios
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
- StatusPage: Timestamps de usuarios, supervisores, eventos
- AdminPage: Fechas en todas las pestañas (pendientes, revisados, cuarentena)
- 🏠 HomePage: Rotación de álbumes destacados
- 📷 Gallery/Album Views: Fechas de imágenes y comentarios

### 🎬 Rotación Automática de Galería Pública
La galería pública ahora muestra álbumes destacados con rotación automática:

**Ubicación**: `pages/HomePage.tsx`

**Características**:
- Rotación cada 30 segundos (configurable)
- ✨ Transición CSS con fade effect
- Muestra imagen de portada del álbum
- Efecto hover con escala y gradiente

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

### Componentes Mejorados

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

## Dependencias Principales

- **react** - Librería de UI
- **react-router-dom** - Enrutamiento
- **axios** - Cliente HTTP
- **@tanstack/react-query** - Gestión de estado del servidor
- **zustand** - Gestión de estado global
- **tailwindcss** - Framework CSS
- **lucide-react** - Iconos SVG

## Despliegue

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

## Variables de Entorno de Producción

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

## Referencias

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

## 📄 Licencia

MIT
