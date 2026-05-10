# Changelog

Todos los cambios notables en este proyecto se documentan en este archivo.

## [1.1.0] - Mayo 2026

### ✨ Nuevo

#### Panel Administrativo "Estado" - Totalmente Interactivo
- **Tiles Clickables**: Usuarios, Supervisores, Ingresos (LOGIN), Salidas (LOGOUT), Álbumes
- **Modales de Detalle**: Drill-down interactivo mostrando datos filtrados en modales
- **Separación por Rol**: Eventos agrupados automáticamente por rol (usuarios, supervisores, admins)
- **Última Actividad de Usuarios**: Muestra último acceso/cambio realizado por cada usuario
- **Componentes**: Nuevo componente Modal reutilizable, helper formatDate para timezone

#### Envío Rápido de Comentarios (Enter-key)
- **Álbumes Pendientes**: Press Enter para enviar comentario sin hacer click en aprobar/rechazar
- **Álbumes Revisados**: Enter actualiza comentario de revisión
- **Imágenes en Cuarentena**: Enter guarda comentario sin cambiar estado de aprobación
- **Ctrl/Cmd+Enter alternativa**: Shift+Enter para nuevas líneas en comentarios
- **Nuevo Endpoint**: `PUT /api/images/{image_id}/comment` para guardar comentarios sin cambio de estado

#### Corrección de Zona Horaria (Ecuador)
- **Conversión Global**: Todas las fechas ahora se muestran en `America/Guayaquil`
- **Helper formatDate()**: Utility function para conversión consistente
- **Áreas Afectadas**:
  - Panel Estado: timestamps de usuarios, supervisores, eventos
  - AdminPage: fechas en todas las pestañas
  - HomePage: galería pública
  - Todas las vistas de álbumes/imágenes

#### Panel Administrativo Completo
- **GET /api/admin/stats**: Estadísticas generales con resumen de usuarios, supervisores, eventos
- **GET /api/admin/users**: Lista completa de usuarios con último acceso
- **GET /api/admin/albums**: Lista de álbumes con estado de aprobación
- **GET /api/admin/events**: Eventos de seguridad filtrados y agrupados por rol
- **GET /api/admin/users/{user_id}/activity**: Actividad detallada de usuario

#### Rotación Automática de Galería Pública
- **Intervalo**: Rotación cada 30 segundos (configurable)
- **Transición**: CSS fade effect suave
- **Portada de Álbum**: Muestra imagen de portada durante rotación
- **Hover Effects**: Escala con gradiente overlay

### 🔧 Cambios Técnicos

#### Backend

**Nuevos Servicios**:
- `backend/services/admin_service.py`: Agregación de métricas y datos administrativos
  - `get_admin_statistics(db)`: Resumen de estadísticas
  - `get_users_list(db)`: Lista de usuarios
  - `get_albums_list(db)`: Lista de álbumes
  - `get_events(db, direction)`: Eventos separados por rol
  - `get_user_activity(db, user_id)`: Actividad por usuario

**Actualizaciones Existentes**:
- `backend/services/image_service.py`: Nueva función `update_image_comment()`
- `backend/routers/image_router.py`: Nuevo endpoint `PUT /images/{image_id}/comment`
- `backend/routers/admin_router.py`: 4 nuevos endpoints para datos administrativos

**Mejoras de Datos**:
- Serialización enriquecida de álbumes: `cover_image_filename`, `latest_image_filename`
- Serialización de imágenes: incluye `uploader_id` para validación de permisos
- Filtrado automático por rol en eventos
- Ordenamiento por timestamp más reciente

#### Frontend

**Nuevos Archivos**:
- `frontend/src/pages/StatusPage.tsx`: Panel administrativo Estado con Modal y drill-down

**Nuevos Componentes**:
- Modal component reutilizable para mostrar drill-down data

**Actualizaciones**:
- `frontend/src/services/api.ts`: 5 nuevos métodos para endpoints administrativos
- `frontend/src/pages/AdminPage.tsx`: Enter-key handlers, formatDate helper
- `frontend/src/pages/HomePage.tsx`: Rotación automática de galería

**Mejoras de UI/UX**:
- Conversión de tiles a botones clickables
- Modales para visualización de datos detallados
- Event grouping en modales
- Soporte para Shift+Enter en comentarios

### 🐛 Correcciones

- Zona horaria incorrecta para usuarios en Ecuador (ahora muestra `America/Guayaquil`)
- Rate limiting excesivo en uploads (removido)
- Steganography threshold muy alto (ajustado a 0.4)
- Galería no se refrescaba después de aprobar/rechazar (ahora invalida cache)

### 🗑️ Eliminado

- Limiter de rate en endpoint `/api/images/upload`
- Validación de steganografía con threshold alto

### 📚 Documentación

- **backend/README.md**: Nuevos endpoints administrativos documentados
- **frontend/README.md**: Nuevas características y cambios de UI documentados
- **CHANGELOG.md**: Este archivo (nuevo)

### 🔐 Seguridad

- Autorización verificada en todos los nuevos endpoints (require_exact_role)
- Validación de uploader_id en operaciones de imagen
- Filtrado de datos por rol en endpoints de admin
- Logs de seguridad para todas las acciones administrativas

---

## [1.0.0] - Abril 2026

### ✨ Nuevo (Versión Inicial)

#### Autenticación y Autorización
- Sistema de usuarios con roles (USER, SUPERVISOR, ADMIN)
- Autenticación JWT con tokens
- Middleware de seguridad
- Tracking de intentos de login

#### Gestión de Álbumes
- Crear, editar, eliminar álbumes
- Álbumes privados y públicos
- Sistema de aprobación (SUPERVISOR/ADMIN)
- Enriquecimiento de datos (cover_image, latest_image)

#### Gestión de Imágenes
- Upload de imágenes con validación
- Sistema de cuarentena para imágenes sospechosas
- Revisión y aprobación de imágenes
- Eliminación de imágenes

#### Detección de Esteganografía
- Análisis LSB (Least Significant Bit)
- Análisis de histograma
- Análisis EOF (End of File)
- Multi-algoritmo para alta precisión

#### Galería Pública
- Visualización de álbumes públicos aprobados
- Browsing de imágenes por álbum
- Interfaz responsiva

#### Panel de Supervisor
- Revisar álbumes pendientes
- Revisar imágenes en cuarentena
- Agregar comentarios a revisiones
- Marcar como aprobado/rechazado

#### Dashboard Admin (Versión Inicial)
- Estadísticas básicas
- Gestión de usuarios
- Gestión de supervisores
- Logs de seguridad

### 🔐 Seguridad Implementada

- Validación de JWT en todos los endpoints protegidos
- Password hashing con bcrypt
- CORS configurado
- Headers de seguridad (CSP, X-Frame-Options, etc.)
- Rate limiting en endpoints críticos
- Validación de archivos (tipo y tamaño)
- Inyección SQL prevención (ORM + Prepared Statements)

### 📦 Stack Tecnológico

**Backend**:
- FastAPI
- SQLAlchemy ORM
- Pydantic v2
- SQLite (default)
- JWT Authentication

**Frontend**:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query v5
- Zustand
- Lucide Icons

---

## Convenciones de Versionado

Este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/):
- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nuevas funcionalidades compatibles hacia atrás
- **PATCH**: Correcciones de bugs compatibles hacia atrás

## Cómo Reportar Issues

Por favor reporta issues con:
1. Descripción clara del problema
2. Pasos para reproducir
3. Comportamiento esperado vs actual
4. Información del ambiente (OS, browser, versión)
5. Logs de error si están disponibles
