# SecureFrame Gallery - Backend

Una API REST segura para gestión de galerías multimedia con detección de esteganografía integrada.

## 🚀 Características

- **Autenticación y Autorización**: Sistema de usuarios con roles y JWT
- **Detección de Esteganografía**: Análisis automático de imágenes con múltiples técnicas
- **Gestión de Álbumes**: Creación y gestión de álbumes privados/públicos
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
git clone <repository-url>
cd esteganografía_galeria/backend
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
DATABASE_URL=postgresql://user:password@localhost:port/....
.....
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

## 🔧 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token

### Álbumes
- `GET /api/albums` - Listar álbumes
- `POST /api/albums` - Crear álbum
- `GET /api/albums/{id}` - Obtener álbum
- `PUT /api/albums/{id}` - Actualizar álbum
- `DELETE /api/albums/{id}` - Eliminar álbum

### Imágenes
- `POST /api/images/upload` - Subir imagen
- `GET /api/images/quarantined` - Imágenes en cuarentena
- `POST /api/images/{id}/review` - Revisar imagen

### Galería Pública
- `GET /api/gallery` - Galería pública
- `GET /api/gallery/{album_id}` - Ver álbum público

## 🛡️ Seguridad

### Detección de Esteganografía
El sistema implementa tres técnicas de análisis:

1. **Análisis LSB**: Detecta patrones en bits menos significativos
2. **Análisis de Histograma**: Identifica anomalías en distribución de colores
3. **Análisis EOF**: Busca datos ocultos al final del archivo

### Roles de Usuario
- **USER**: Usuario básico
- **SUPERVISOR**: Puede revisar imágenes en cuarentena
- **ADMIN**: Acceso completo

### Headers de Seguridad
- Content Security Policy
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Y más...

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── config.py          # Configuración de la aplicación
├── database/
│   ├── database.py        # Conexión a base de datos
│   └── models.py          # Modelos SQLAlchemy
├── routers/
│   ├── auth_router.py     # Endpoints de autenticación
│   ├── album_router.py    # Endpoints de álbumes
│   ├── image_router.py    # Endpoints de imágenes
│   └── gallery_router.py  # Endpoints de galería
├── security/
│   ├── auth.py           # Lógica de autenticación
│   ├── middleware.py     # Middleware de seguridad
│   └── steganography.py  # Detección de esteganografía
├── services/
│   ├── gallery_service.py # Lógica de negocio galería
│   └── image_service.py   # Lógica de negocio imágenes
├── uploads/               # Archivos subidos
├── main.py               # Aplicación FastAPI
├── requirements.txt      # Dependencias Python
├── Dockerfile           # Configuración Docker
└── .env.example         # Variables de entorno ejemplo
```

## 🔍 Monitoreo y Logs

La aplicación incluye logging automático de:
- Eventos de seguridad
- Intentos de login fallidos
- Actividades sospechosas
- Errores de la aplicación

## 🚨 Manejo de Errores

La API devuelve respuestas HTTP consistentes:
- `200` - Éxito
- `400` - Bad Request
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `413` - Archivo demasiado grande
- `429` - Rate limit excedido

## 🚀 Crear o regenerar tablas

El proyecto utiliza SQLAlchemy para la gestión de tablas.

Las tablas se definen en `database/models.py`.

Si una tabla no existe (por ejemplo `login_attempts`) o fue eliminada, puedes recrearlas con:

```bash
python -m database.init_db
```