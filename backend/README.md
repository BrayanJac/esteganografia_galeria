# SecureFrame Gallery - Backend

Una API REST segura para gestión de galerías multimedia con detección de esteganografía integrada.

## 🚀 Características

- **Autenticación y Autorización**: Sistema de usuarios con roles y JWT
- **Detección de Esteganografía**: Análisis automático de imágenes con múltiples técnicas
- **Gestión de Álbumes**: Creación y gestión de álbumes privados/públicos con aprobación
- **Sistema de Cuarentena**: Aislamiento automático de imágenes sospechosas
- **Seguridad Avanzada**: Headers de seguridad, rate limiting, logging
- **Documentación API**: Swagger/OpenAPI integrado

## 📋 Requisitos

- Python 3.8+
- PostgreSQL
- Docker (opcional)

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
cd backend
```

### 2. Crear entorno virtual
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Editar `.env` con tu configuración:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:port/dbname
SECRET_KEY=tu_secreto_jwt_muy_seguro
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 5. Configurar base de datos
```bash
# Crear base de datos PostgreSQL
CREATE DATABASE secure_gallery;
```

### 6. Ejecutar aplicación
```bash
python main.py
```

La API estará disponible en `http://localhost:8000`

## 📚 Documentación API

Una vez iniciada la aplicación, puedes acceder a:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## 🔧 Endpoints de la API

### 🔐 Autenticación (`/api/auth`)

#### `POST /api/auth/register`
Registrar un nuevo usuario.
- **Rate Limit**: 5 peticiones por minuto
- **Body**:
```json
{
  "username": "string (3-50 chars)",
  "email": "email@valido.com",
  "password": "string (mínimo 12 chars)"
}
```

#### `POST /api/auth/login`
Iniciar sesión y obtener token JWT.
- **Rate Limit**: 10 peticiones por minuto
- **Body**:
```json
{
  "username": "string",
  "password": "string"
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

