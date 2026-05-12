# 🚀 Guía de Inicio Rápido - SecureGallery Frontend

## 1️⃣ Requisitos Previos

Asegúrate de tener instalado:
- **Node.js** 16+ ([descargar](https://nodejs.org))
- **npm** (incluido con Node.js)
- **Backend corriendo** en `http://localhost:8000`

## 2️⃣ Instalación (5 minutos)

```bash
# 1. Entra en la carpeta del frontend
cd frontend

# 2. Instala las dependencias
npm install

# 3. Copia el archivo de configuración
cp .env.example .env

# 4. Inicia el servidor de desarrollo
npm run dev
```

## 3️⃣ Acceder a la Aplicación

Abre tu navegador en:
```
http://localhost:5173
```

## 📱 Primeros Pasos

### 1. Registrarse
- Click en "Registrarse"
- Completa el formulario (contraseña mínimo 12 caracteres)
- Confirma que aceptas los términos

### 2. Iniciar Sesión
- Usa las credenciales que acabas de crear
- Serás redirigido a tu galería personal

### 3. Crear un Álbum
- Click en "Nuevo Álbum"
- Dale un título y descripción
- Marca como público o privado
- Click en "Crear"

### 4. Subir Imágenes
- En el álbum, click en "Subir imagen"
- Selecciona las imágenes de tu computadora
- Las imágenes se analizarán automáticamente

### 5. Revisar Análisis
- Las imágenes mostrarán su estado:
  - ✓ **Limpia** - Sin esteganografía
  - ⚠️ **Cuarentena** - Esteganografía detectada
  - 🔄 **Analizando** - En proceso

## 🛠️ Comandos Útiles

```bash
# Desarrollo (con hot reload)
npm run dev

# Build para producción
npm run build

# Ver build de producción localmente
npm run preview

# Verificar tipos TypeScript
npm run type-check

# Linter para detectar errores
npm run lint
```

## 🔧 Configuración

### Variables de Entorno (.env)
```env
# URL del backend (por defecto: http://localhost:8000/api)
VITE_API_URL=http://localhost:8000/api
```

### Cambiar la URL del Backend
Si tu backend está en otro puerto, edita `.env`:
```env
VITE_API_URL=http://localhost:8001/api  # ejemplo: puerto 8001
```

## 📁 Estructura Principal

```
frontend/
├── src/
│   ├── components/       # Componentes reutilizables
│   ├── pages/           # Páginas principales
│   ├── services/        # Comunicación con API
│   ├── hooks/           # Lógica personalizada
│   ├── store/           # Estado global
│   └── types/           # Definiciones TypeScript
├── index.html           # HTML principal
├── package.json         # Dependencias
└── vite.config.ts       # Configuración de Vite
```

## 🔗 Rutas Principales

| Ruta | Descripción | Requiere Login |
|------|-------------|---|
| `/` | Página de inicio | No |
| `/login` | Iniciar sesión | No |
| `/register` | Registrarse | No |
| `/gallery` | Mi galería | ✅ |
| `/album/:id` | Detalles del álbum | ✅ |
| `/admin` | Panel admin | ✅ (Admin/Supervisor) |

## 🐛 Problemas Comunes

### "Cannot GET /api/..."
❌ **Problema:** El backend no está corriendo
✅ **Solución:** Inicia el backend en otra terminal con `python main.py`

### "CORS error"
❌ **Problema:** El backend y frontend no se comunican
✅ **Solución:** 
- Verifica que el backend esté en `http://localhost:8000`
- Revisa que el CORS esté habilitado en el backend

### Las imágenes no se cargan
❌ **Problema:** La carpeta `uploads` no existe
✅ **Solución:** El backend crea la carpeta automáticamente al subir la primera imagen

### TypeError: Cannot read property...
❌ **Problema:** Tipo de dato incorrecto
✅ **Solución:** Comprueba con `npm run type-check`

## 📚 Documentación Importante

- [Documentación del Backend](../backend/README.md)
- [Tipos TypeScript](./src/types/index.ts)
- [Servicios de API](./src/services/api.ts)
- [Hooks Personalizados](./src/hooks/)

## 🚀 Siguientes Pasos

### Desarrollo
1. Lee el [README completo](./README.md)
2. Explora la estructura en `src/`
3. Comprende cómo funciona el flujo de autenticación

### Producción
1. Build: `npm run build`
2. Sube la carpeta `dist/` a tu servidor
3. Configura las variables de entorno correctas

## 🤝 Contribución

Para contribuir al proyecto:
1. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
2. Haz tus cambios
3. Commit: `git commit -am 'Añade nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📞 Soporte

Si encuentras problemas:
1. Revisa los [problemas comunes](#-problemas-comunes)
2. Lee la documentación completa
3. Crea un issue en GitHub

## 💡 Tips

- 🔍 Abre DevTools (F12) para ver errores
- 📊 Usa React DevTools para debuggear componentes
- 🌐 Prueba en incógnito si hay problemas de cache
- 💾 Guarda archivos para hot reload automático

---

¡Listo! 🎉 Ya puedes empezar a trabajar con SecureGallery.

Para dudas técnicas: Revisa el README completo o la documentación del backend.
