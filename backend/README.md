# 🔒 SecureGallery Backend

API REST segura con FastAPI para gestión de galerías multimedia y detección avanzada de esteganografía.

## 🚀 Características

✅ **Autenticación Segura** - JWT + Argon2 hashing con prevención de brute force  
✅ **Detección de Esteganografía** - 4 algoritmos: LSB, Histogram, EOF, Frequency Domain  
✅ **Gestión de Álbumes** - Flujo de aprobación con supervisores  
✅ **Sistema de Cuarentena** - Aislamiento automático de imágenes sospechosas  
✅ **Control de Roles** - Usuario, Supervisor, Admin con permisos granulares  
✅ **Rate Limiting** - Protección contra ataques por fuerza bruta  
✅ **Auditoría Completa** - Logging de eventos y trazabilidad  
✅ **Documentación API** - Swagger/OpenAPI interactivo  

## 📋 Requisitos

- Python 3.14+
- SQLite (incluido) o PostgreSQL (producción)
- pip (gestor de paquetes Python)

## 🛠️ Instalación

### 1. Clonar y Navegar
```bash
git clone https://github.com/BrayanJac/esteganografia_galeria.git
cd esteganografia_galeria/backend
```

### 2. Crear Entorno Virtual
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar Variables de Entorno
```bash
cp .env.example .env
```

Editar `.env`:
```env
# Base de Datos
DATABASE_URL=sqlite:///./test.db

# JWT
SECRET_KEY=tu-clave-muy-segura-minimo-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Seguridad
PASSWORD_MIN_LENGTH=12
LOGIN_ATTEMPTS_LIMIT=5
LOGIN_ATTEMPTS_WINDOW_MINUTES=15
MAX_FILE_SIZE=10485760

# Esteganografía
STEGANOGRAPHY_THRESHOLD=0.4
ENABLE_LSB_ANALYSIS=true
ENABLE_HISTOGRAM_ANALYSIS=true
ENABLE_EOF_ANALYSIS=true

# CORS
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

### 5. Inicializar Base de Datos
```bash
python -m database.init_db
```

### 6. Ejecutar la Aplicación
```bash
python main.py
```

✅ Backend disponible en `http://localhost:8000`

## 📚 Documentación API

Una vez iniciada la aplicación, accede a:

- **Swagger UI Interactivo:** `http://localhost:8000/docs` ⭐
- **ReDoc (Alternativo):** `http://localhost:8000/redoc`
- **OpenAPI JSON Schema:** `http://localhost:8000/openapi.json`

## 🔑 Autenticación

### JWT Tokens
```python
# Login retorna:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "usuario": {
    "id": 1,
    "username": "usuario",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Headers Requeridos
```bash
Authorization: Bearer <token>
```

### Validación de Contraseña
- ✅ Mínimo 12 caracteres
- ✅ Mayúscula obligatoria (A-Z)
- ✅ Minúscula obligatoria (a-z)
- ✅ Número obligatorio (0-9)
- ✅ Carácter especial obligatorio (!@#$%^&*)

## 🎭 Detección de Esteganografía

### 4 Algoritmos Complementarios

#### 1. LSB Analysis (25% peso)
Detecta manipulación del bit menos significativo:
- Análisis de correlación MSB-LSB
- Chi-square test de uniformidad
- Análisis de adyacencia de píxeles
- Block-based LSB uniformity
- RS Analysis (Regular-Singular)
- Frequency domain LSB detection

#### 2. Histogram Analysis (20% peso)
Detecta discontinuidades en histograma:
- Saltos abruptos de frecuencia
- Asimetrías innaturales
- Bandas vacías (gaps)

#### 3. EOF Analysis (15% peso)
Detecta datos fuera del archivo legítimo:
- Datos después del EOF marker
- Segmentos adicionales JPEG
- Metadatos modificados

#### 4. Frequency Domain Analysis (40% peso)
Detecta anomalías en dominio de frecuencia:
- DCT (Discrete Cosine Transform)
- FFT (Fast Fourier Transform)
- Análisis de energía en coeficientes
- Cambios en altas frecuencias

### Scoring Sistema
```python
overall_score = (
    lsb_score * 0.25 +           # 25%
    histogram_score * 0.20 +      # 20%
    eof_score * 0.15 +           # 15%
    frequency_score * 0.40        # 40%
)

Resultado:
- overall_score > threshold → QUARANTINED
- overall_score < threshold → CLEAN
```

## 🔐 Seguridad Implementada

### Autenticación
- ✅ JWT con expiración (30 minutos)
- ✅ Argon2 hashing (resistente GPU brute-force)
- ✅ Prevención brute force: 5 intentos / 15 min = bloqueo
- ✅ Validación de contraseña fuerte

### Network Security
- ✅ CORS restrictivo (whitelist explícita)
- ✅ Security Headers (CSP, HSTS, X-Frame-Options)
- ✅ Rate Limiting por IP
- ✅ Detección de herramientas de ataque

### Data Protection
- ✅ SQL Injection prevention (SQLAlchemy ORM)
- ✅ XSS prevention (Content-Security-Policy)
- ✅ File upload validation (tipo MIME, tamaño)
- ✅ Input validation y sanitización

### Auditoría
- ✅ Logging de intentos de login
- ✅ Tracking de eventos de seguridad
- ✅ Trazabilidad de acciones por usuario
- ✅ Identificación de patrones sospechosos

## 📂 Estructura de Carpetas

```
backend/
├── main.py                    # 🚀 Punto de entrada
├── requirements.txt           # Dependencias
├── .env                       # Configuración local
├── config/
│   └── config.py             # Variables de configuración
├── database/
│   ├── database.py           # Conexión SQLAlchemy
│   ├── models.py             # 🗂️ Modelos ORM
│   └── init_db.py            # Inicializador BD
├── routers/                   # 🔗 Endpoints API
│   ├── auth_router.py        # Login, Register, JWT
│   ├── album_router.py       # CRUD Álbumes
│   ├── image_router.py       # Upload, Análisis
│   ├── gallery_router.py     # Galería pública
│   └── admin_router.py       # Panel administrativo
├── services/                  # 💼 Lógica de negocio
│   ├── auth_service.py
│   ├── album_service.py
│   ├── image_service.py
│   ├── gallery_service.py
│   └── admin_service.py
├── schemas/                   # ✔️ Validación Pydantic
│   ├── auth_schemas.py
│   ├── album_schemas.py
│   └── image_schemas.py
├── security/                  # 🔐 Autenticación & Análisis
│   ├── auth.py               # JWT, hashing
│   ├── steganography.py      # 🎭 Detección esteganografía
│   └── middleware.py         # CORS, Rate Limiting
└── uploads/                   # 📁 Almacenamiento imágenes
```

## 🎯 Endpoints Principales

### Autenticación
```
POST   /api/auth/register      # Registrar usuario
POST   /api/auth/login         # Iniciar sesión
GET    /api/auth/me            # Obtener usuario actual
POST   /api/auth/logout        # Cerrar sesión
```

### Álbumes
```
GET    /api/albums/library     # Mis álbumes
POST   /api/albums/            # Crear álbum
PUT    /api/albums/{id}        # Actualizar álbum
DELETE /api/albums/{id}        # Eliminar álbum
GET    /api/albums/pending     # Álbumes pendientes (Supervisor)
POST   /api/albums/{id}/approve # Aprobar/rechazar (Supervisor)
```

### Imágenes
```
POST   /api/images/upload      # 📤 Subir imagen + análisis
GET    /api/images/quarantined # Imágenes cuarentenadas (Supervisor)
POST   /api/images/{id}/review # Revisar imagen (Supervisor)
DELETE /api/images/{id}        # Eliminar imagen
```

### Galería Pública
```
GET    /api/gallery            # Galerías públicas
GET    /api/gallery/{id}       # Imágenes de galería
```

### Admin
```
GET    /api/admin/stats        # Estadísticas
GET    /api/admin/users        # Lista usuarios
GET    /api/admin/albums       # Lista álbumes
GET    /api/admin/events       # Eventos de seguridad
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:8000/health

# Crear usuario
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!"
  }'
```

## 📦 Dependencias Principales

```
fastapi==0.104.1              # Framework web
uvicorn==0.24.0               # Servidor ASGI
sqlalchemy==2.0.23            # ORM
pydantic==2.4.2               # Validación
python-jose==3.3.0            # JWT
passlib==1.7.4                # Hashing
argon2-cffi==23.1.0           # Argon2
slowapi==0.1.9                # Rate limiting
pillow==10.0.1                # Procesamiento imágenes
opencv-python==4.8.1          # Análisis imágenes
numpy==1.24.3                 # Cálculos numéricos
scipy==1.11.3                 # Análisis científico
python-dotenv==1.0.0          # Configuración
```

## 🚀 Deployment

### Producción con Gunicorn
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Con PostgreSQL
```env
DATABASE_URL=postgresql://user:password@host:5432/secure_gallery
```

### Variables Críticas a Cambiar
```env
SECRET_KEY=<genera una clave aleatoria fuerte>
DEBUG=False
ALLOWED_ORIGINS=["https://tudominio.com"]
```

## 📖 Documentación Completa

- [README Principal](../README.md) - Información general
- [Guía Rápida](../QUICKSTART.md) - Inicio rápido
- [Referencia API Admin](../API_ADMIN_REFERENCE.md) - Endpoints admin detallados

---

**Última actualización:** Mayo 2026
}
```

#### `GET /api/auth/me`
Obtener información del usuario actual.
- **Headers**: `Authorization: Bearer <token>`

#### `POST /api/auth/supervisors` ⭐
Crear un nuevo supervisor (Solo ADMIN).
- **Body**:
```json
{
  "username": "string (3-50 chars)",
  "email": "email@valido.com",
  "password": "string (mínimo 12 chars)"
}
```

#### `GET /api/auth/supervisors` ⭐
Obtener todos los supervisores (Solo ADMIN).

#### `GET /api/auth/users` ⭐
Obtener todos los usuarios (Solo ADMIN).

#### `DELETE /api/auth/supervisors/{supervisor_id}` ⭐
Eliminar un supervisor (Solo ADMIN).

#### `DELETE /api/auth/users/{user_id}` ⭐
Eliminar un usuario (Solo ADMIN).

---

### 📁 Álbumes (`/api/albums`)

#### `POST /api/albums/`
Crear un nuevo álbum (Requiere rol USER).
- **Body**:
```json
{
  "title": "string",
  "description": "string (opcional)",
  "is_public": "boolean"
}
```

#### `GET /api/albums/`
Obtener los álbumes del usuario actual.

#### `GET /api/albums/library`
Obtener álbumes accesibles para el usuario actual.

#### `GET /api/albums/pending` ⭐
Obtener álbumes pendientes de aprobación (Solo SUPERVISOR/ADMIN).

#### `GET /api/albums/admin` ⭐
Obtener todos los álbumes (Solo ADMIN).

#### `GET /api/albums/reviewed` ⭐
Obtener álbumes revisados (Solo SUPERVISOR/ADMIN).

#### `GET /api/albums/{album_id}`
Obtener detalles de un álbum específico.

#### `POST /api/albums/{album_id}/approve` ⭐
Aprobar/rechazar un álbum (Solo SUPERVISOR/ADMIN).
- **Body**:
```json
{
  "approved": "boolean",
  "comment": "string (opcional)"
}
```

#### `PUT /api/albums/{album_id}`
Actualizar un álbum existente (Requiere rol USER).
- **Body**:
```json
{
  "title": "string",
  "description": "string (opcional)"
}
```

#### `PUT /api/albums/{album_id}/review` ⭐
Actualizar la revisión de un álbum (Solo SUPERVISOR/ADMIN).
- **Body**:
```json
{
  "approved": "boolean",
  "review_comment": "string (opcional)"
}
```

#### `DELETE /api/albums/{album_id}` ⭐
Eliminar un álbum (Solo ADMIN).

---

### 🖼️ Imágenes (`/api/images`)

#### `POST /api/images/upload`
Subir una imagen a un álbum.
- **Rate Limit**: 10 peticiones por hora
- **Form Data**:
  - `album_id`: integer
  - `file`: image file (multipart/form-data)

#### `GET /api/images/quarantined` ⭐
Obtener imágenes en cuarentena (Solo SUPERVISOR/ADMIN).

#### `POST /api/images/{image_id}/review` ⭐
Revisar una imagen en cuarentena (Solo SUPERVISOR/ADMIN).
- **Body**:
```json
{
  "approved": "boolean",
  "comment": "string (opcional)"
}
```

#### `DELETE /api/images/{image_id}`
Eliminar una imagen (propietario de la imagen).

---

### 📊 Panel Administrativo (`/api/admin`) ⭐

#### `GET /api/admin/stats`
Obtener estadísticas generales del sistema (Solo ADMIN).
- **Response**:
```json
{
  "total_users": "integer",
  "total_supervisors": "integer",
  "pending_albums": "integer",
  "quarantined_images": "integer",
  "users_list": ["array of users"],
  "supervisors_list": ["array of supervisors"],
  "recent_events": ["array of recent login/logout events"]
}
```

#### `GET /api/admin/users`
Obtener lista de todos los usuarios con información de acceso (Solo ADMIN).
- **Response**: Array de usuarios con `username`, `email`, `role`, `last_login_attempt`

#### `GET /api/admin/albums`
Obtener lista de todos los álbumes con estado de aprobación (Solo ADMIN).
- **Response**: Array de álbumes con `title`, `owner`, `status`, `image_count`, `created_at`, `updated_at`

#### `GET /api/admin/events?direction={ingress|egress}`
Obtener eventos de seguridad (ingresos/salidas) separados por rol (Solo ADMIN).
- **Query Parameters**:
  - `direction`: `ingress` (LOGIN), `egress` (LOGOUT), o sin especificar (todos)
- **Response**: Array de eventos con `event_type`, `description`, `username`, `role`, `timestamp`

#### `GET /api/admin/users/{user_id}/activity`
Obtener actividad detallada de un usuario específico (Solo ADMIN).
- **Response**:
```json
{
  "albums": {
    "approved": "integer",
    "rejected": "integer",
    "pending": "integer"
  },
  "recent_logs": ["array of security logs"],
  "last_action": "album|image|log",
  "last_action_at": "ISO timestamp"
}
```

---

### 🌐 Galería Pública (`/api`)

#### `GET /api/gallery`
Obtener la galería pública (álbumes públicos aprobados).

#### `GET /api/gallery/{album_id}`
Obtener imágenes de un álbum público específico.

#### `GET /api/uploads/{filename}`
Servir archivos de imagen estáticos.

---

### 🔍 Sistema

#### `GET /health`
Verificar el estado de la API y la conexión a la base de datos.
- **Response**:
```json
{
  "estado": "saludable",
  "timestamp": "2024-01-01T00:00:00",
  "database": "conectada"
}
```

#### `GET /internal/db_tables`
Obtener lista de tablas de la base de datos (endpoint interno).

---

## 🛡️ Roles de Usuario

- **USER**: Usuario básico, puede crear álbumes y subir imágenes
- **SUPERVISOR**: Puede revisar imágenes y álbumes en cuarentena
- **ADMIN**: Acceso completo, puede gestionar usuarios y supervisores

⭐ = Requiere rol elevado (SUPERVISOR o ADMIN)

## 🛡️ Seguridad

### Detección de Esteganografía
El sistema implementa tres técnicas de análisis automáticas:

1. **Análisis LSB (Least Significant Bit)**: Detecta patrones en bits menos significativos
2. **Análisis de Histograma**: Identifica anomalías en distribución de colores
3. **Análisis EOF (End of File)**: Busca datos ocultos al final del archivo

Las imágenes sospechosas se colocan automáticamente en cuarentena para revisión manual.

### Headers de Seguridad
La API incluye headers de seguridad automáticos:
- **Content Security Policy**: Previene XSS y ataques de inyección
- **X-Content-Type-Options**: Evita MIME-sniffing
- **X-Frame-Options**: Previene clickjacking
- **X-XSS-Protection**: Activación de filtros XSS del navegador
- **Rate Limiting**: Límites de peticiones por endpoint

### Autenticación y Autorización
- **JWT Tokens**: Tokens firmados con expiración configurable
- **Password Hashing**: Utiliza bcrypt para almacenamiento seguro de contraseñas
- **Role-Based Access Control**: Control de acceso basado en roles
- **Login Attempt Tracking**: Registro de intentos de acceso fallidos

## 📁 Estructura del Proyecto

```
backend/
├── config/                 # Configuración de la aplicación
├── database/              # Base de datos y modelos
│   ├── database.py        # Conexión y gestión de DB
│   ├── models.py          # Modelos SQLAlchemy
│   └── init_db.py         # Inicialización de tablas
├── routers/               # Endpoints de la API
│   ├── auth_router.py     # Autenticación y usuarios
│   ├── album_router.py    # Gestión de álbumes
│   ├── image_router.py    # Subida y revisión de imágenes
│   └── gallery_router.py  # Galería pública
├── schemas/               # Modelos Pydantic
│   ├── auth_schemas.py    # Schemas de autenticación
│   ├── album_schemas.py   # Schemas de álbumes
│   └── image_schemas.py   # Schemas de imágenes
├── security/              # Seguridad y autenticación
│   ├── auth.py           # Lógica de JWT y roles
│   ├── middleware.py     # Middleware de seguridad
│   └── steganography.py  # Detección de esteganografía
├── services/              # Lógica de negocio
│   ├── auth_service.py   # Servicios de autenticación
│   ├── album_service.py  # Servicios de álbumes
│   ├── image_service.py  # Servicios de imágenes
│   └── gallery_service.py # Servicios de galería
├── uploads/               # Archivos subidos (imágenes)
├── main.py               # Aplicación FastAPI principal
├── requirements.txt      # Dependencias Python
├── .env.example         # Variables de entorno ejemplo
└── .gitignore           # Archivos ignorados por Git
```

##   Ejemplos de Uso

### Autenticación
```bash
# Registrar usuario
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "miusuario",
    "email": "usuario@ejemplo.com",
    "password": "MiClaveSegura123!"
  }'

# Iniciar sesión
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "miusuario",
    "password": "MiClaveSegura123!"
  }'
```

### Crear Álbum
```bash
curl -X POST "http://localhost:8000/api/albums/" \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mis Vacaciones",
    "description": "Fotos de mis vacaciones",
    "is_public": true
  }'
```

### Subir Imagen
```bash
curl -X POST "http://localhost:8000/api/images/upload" \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -F "album_id=1" \
  -F "file=@/ruta/a/tu/imagen.jpg"
```

##  🔍 Monitoreo y Logs

La aplicación incluye logging automático de:
- **Eventos de seguridad**: Accesos, cambios de rol, etc.
- **Intentos de login fallidos**: Con IP y timestamp
- **Actividades sospechosas**: Detección de esteganografía
- **Errores de la aplicación**: Excepciones y warnings

Los logs se muestran en consola y pueden configurarse para archivo.

## 🚨 Manejo de Errores

La API devuelve respuestas HTTP consistentes:
- `200` - Éxito
- `201` - Recurso creado
- `400` - Bad Request (datos inválidos)
- `401` - No autorizado (token inválido o ausente)
- `403` - Prohibido (permisos insuficientes)
- `404` - No encontrado
- `413` - Archivo demasiado grande
- `422` - Error de validación
- `429` - Rate limit excedido
- `500` - Error interno del servidor

#
## 🚀 Gestión de Base de Datos

### Crear o Regenerar Tablas
El proyecto utiliza SQLAlchemy para la gestión de tablas.

Las tablas se definen en `database/models.py`.

Si una tabla no existe (por ejemplo `login_attempts`) o fue eliminada, puedes recrearlas con:

```bash
python -m database.init_db
```

### Migraciones
Para cambios en el esquema de base de datos:
1. Modificar los modelos en `database/models.py`
2. Ejecutar el script de inicialización
3. **ADVERTENCIA**: Esto puede perder datos existentes

## 🔧 Configuración Avanzada

### Rate Limiting Personalizado
Los límites se configuran en los decoradores `@limiter.limit()` de cada endpoint:
- `5/minute` - 5 peticiones por minuto
- `10/hour` - 10 peticiones por hora
- `100/day` - 100 peticiones por día

### Archivos Permitidos
Por defecto se permiten: `jpg`, `jpeg`, `png`, `gif`, `bmp`, `webp`

### Tamaño Máximo de Archivo
Configurado en el servicio de imágenes (por defecto: 10MB)

---

## ✨ Cambios Recientes (Mayo 2026)

### 📊 Panel Administrativo "Estado" - Totalmente Interactivo
Se ha implementado un panel administrativo completo en el frontend con capacidad de **drill-down interactivo**:

- **Tiles Clickables**: Usuarios, Supervisores, Ingresos (ingress), Salidas (egress), Álbumes
- **Modales de Detalle**: Cada tile abre un modal mostrando datos filtrados
- **Separación por Rol**: Los eventos se separan automáticamente por rol (usuarios, supervisores, admins)
- **Últimos Accesos**: Se muestran los últimos intentos de login de cada usuario

**Endpoints Backend Relacionados**:
- `GET /api/admin/stats` - Estadísticas generales
- `GET /api/admin/users` - Lista de usuarios
- `GET /api/admin/albums` - Lista de álbumes
- `GET /api/admin/events?direction={ingress|egress}` - Eventos separados por rol
- `GET /api/admin/users/{user_id}/activity` - Actividad por usuario

### ⌨️ Envío de Comentarios con Enter
Se ha mejorado la experiencia de usuario en el panel administrativo:

- **Álbumes Pendientes**: Presionar Enter en el campo de comentarios envía el comentario automáticamente
- **Álbumes Revisados**: Enter actualiza el comentario de revisión sin necesidad de hacer click en Aprobar/Rechazar
- **Imágenes en Cuarentena**: Enter guarda el comentario (nuevo endpoint: `PUT /api/images/{id}/comment`)

**Nuevo Endpoint Backend**:
- `PUT /api/images/{image_id}/comment` - Guardar comentario sin cambiar estado

**Servicios Actualizados**:
- `image_service.py` - Nueva función `update_image_comment()`
- `image_router.py` - Nuevo endpoint para actualizar comentarios

### 🌍 Corrección de Zona Horaria (Ecuador)
Todas las fechas y horas ahora se muestran en la zona horaria de Ecuador (**America/Guayaquil**):

- **StatusPage**: Todos los timestamps de usuarios, supervisores y eventos
- **AdminPage**: Fechas en todas las pestañas (pendientes, revisados, cuarentena)
- **Formato**: Utiliza `toLocaleString()` con conversión a zona horaria local

Esta corrección afecta a:
- Último acceso de usuarios
- Timestamps de eventos (ingresos/salidas)
- Fechas de creación y actualización de álbumes
- Timestamps de comentarios

### 📋 Servicios Administrativos Mejorados

**Nuevo archivo**: `backend/services/admin_service.py`

Funciones principales:
- `get_admin_statistics(db)` - Resumen de estadísticas con listas de usuarios/supervisores/eventos
- `get_users_list(db)` - Lista completa de usuarios con último acceso
- `get_albums_list(db)` - Lista de álbumes con estado de aprobación
- `get_events(db, direction)` - Eventos filtrados por ingreso/salida y agrupados por rol
- `get_user_activity(db, user_id)` - Actividad detallada por usuario

Todas estas funciones incluyen:
- Filtrado por rol
- Ordenamiento por timestamp más reciente
- Serialización de fechas en formato ISO
- Manejo de casos sin datos

---

