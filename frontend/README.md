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
```

## 🎨 Customización de Temas

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
