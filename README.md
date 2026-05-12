# 🖼️ SecureGallery - Galería Multimedia Segura

Una aplicación web completa y segura para gestionar galerías de imágenes con **detección avanzada de esteganografía**, **autenticación robusta** y **sistema de roles granular**.

[![Estado: Producción](https://img.shields.io/badge/Estado-Producción-green)](https://github.com/BrayanJac/esteganografia_galeria)
[![Python 3.14](https://img.shields.io/badge/Python-3.14-blue)](https://www.python.org/)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![React 18](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)

## Tabla de Contenidos

1. [¿Qué es SecureGallery?](#qué-es-securegallery)
2. [Características Principales](#características-principales)
3. [Tecnología Stack](#tecnología-stack)
4. [Requisitos Previos](#requisitos-previos)
5. [Instalación Rápida](#instalación-rápida)
6. [Ejecución](#ejecución)
7. [Arquitectura](#arquitectura)
8. [Seguridad Implementada](#seguridad-implementada)
9. [Estructura del Proyecto](#estructura-del-proyecto)
10. [Guía de Desarrollo](#guía-de-desarrollo)

---

## ¿Qué es SecureGallery?

**SecureGallery** es una plataforma web diseñada para gestionar y proteger galerías de imágenes mediante detección inteligente de contenido esteganografiado. Combina funcionalidades modernas de web con algoritmos avanzados de análisis digital.

### Características Principales

✅ **Gestión de Galerías** - Crear, editar, compartir y organizar álbumes de fotos  
✅ **Autenticación Segura** - JWT + Argon2 hashing con prevención de brute force  
✅ **Detección de Esteganografía** - 4 algoritmos complementarios (LSB, Histogram, EOF, FFT/DCT)  
✅ **Sistema de Cuarentena** - Aislamiento automático de imágenes sospechosas  
✅ **Control de Acceso** - Roles: Usuario, Supervisor, Admin  
✅ **Auditoría de Seguridad** - Logging de eventos y intentos de acceso  
✅ **Rate Limiting** - Protección contra ataques por fuerza bruta  
✅ **Galería Pública** - Compartir álbumes públicos de forma segura  

### ¿Qué es la Esteganografía?

La **esteganografía** es la técnica de ocultar información dentro de otros archivos (especialmente imágenes) sin que se note a simple vista. Diferente de la criptografía (que encripta), la esteganografía disimula.

**Ejemplos:**
- Embeber un documento de texto en una imagen JPEG
- Ocultar claves SSH en datos de píxeles
- Ocultación de malware en archivos multimedia

**¿Por qué detectarla?**
- Prevenir infiltración de malware
- Detectar intentos de filtración de datos
- Cumplir regulaciones de seguridad
- Proteger la integridad del contenido

---

## 🛠️ Tecnología Stack

### Backend
| Componente | Tecnología | Versión |
|---|---|---|
| Framework API | FastAPI | 0.104+ |
| Servidor ASGI | Uvicorn | 0.24+ |
| ORM | SQLAlchemy | 2.0+ |
| Validación | Pydantic | 2.0+ |
| Autenticación | Python-JOSE + Passlib | - |
| Hashing | Argon2 | - |
| Rate Limiting | SlowAPI | - |
| Procesamiento imágenes | Pillow, OpenCV, NumPy, SciPy | - |
| Base de Datos | SQLite (desarrollo) / PostgreSQL (producción) | - |

### Frontend
| Componente | Tecnología | Versión |
|---|---|---|
| Librería UI | React | 18.2+ |
| Lenguaje | TypeScript | 5.3+ |
| Bundler | Vite | 8.0+ |
| Estilos | Tailwind CSS | 3.3+ |
| HTTP Client | Axios | 1.6+ |
| State Management | Zustand | - |
| Router | React Router | 6.0+ |
| Server State | React Query/TanStack Query | - |
| Iconos | Lucide React | - |

---

## 📋 Requisitos Previos

Antes de empezar, verifica que tengas instalado:

### 1. Python 3.14+
```bash
python --version  # Debe ser >= 3.14
```
[Descargar Python](https://www.python.org/downloads/)

### 2. Node.js 18+
```bash
node --version   # Debe ser >= 18
npm --version    # Debe estar incluido
```
[Descargar Node.js](https://nodejs.org/)

### 3. Git (Recomendado)
```bash
git --version
```
[Descargar Git](https://git-scm.com/downloads)

### 4. SQLite (Incluido en Python)
No necesita instalación adicional. SQLite se crea automáticamente al iniciar.

---

## Instalación Paso a Paso

### PASO 1: Descargar el Proyecto

**Opción A: Con Git (Recomendado)**
```bash
git clone https://github.com/BrayanJac/esteganografia_galeria.git
cd esteganografia_galeria
```

**Opción B: Descarga manual**
1. Ve a: https://github.com/BrayanJac/esteganografia_galeria
2. Click en "Code" → "Download ZIP"
3. Descomprime la carpeta

---

### PASO 2: Configurar Base de Datos

#### 2.1 Crear o regenerar tablas

En desarrollo local no tienes que crear una base manualmente. Solo ejecuta el inicializador:

```bash
cd backend
python -m database.init_db
```

Si necesitas limpiar la tabla de intentos de acceso y volver a generar el esquema, ejecuta el mismo inicializador después de eliminar la tabla en tu base local.

#### 2.2 Verificar la base de datos

La app usa SQLite por defecto, así que el archivo local se crea automáticamente al iniciar el backend o al ejecutar el inicializador.

---

### PASO 3: Instalar Backend

#### 3.1 Entra en la carpeta del backend
```bash
cd backend
```

#### 3.2 Crear entorno virtual
Un "entorno aislado" para las dependencias de Python.

```bash
# En Windows
python -m venv venv
venv\Scripts\activate

# En Mac/Linux
python -m venv venv
source venv/bin/activate
```

#### 3.3 Instalar dependencias
```bash
python3 -m pip install -r requirements.txt
```

#### 3.4 Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Abre el archivo `.env` con un editor de texto y edita:

```env
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=cambia-esto-a-una-clave-segura-larga
```

#### 3.5 Crear tablas en la base de datos
```bash
python -m database.init_db
```

#### 3.6 Iniciar el backend
```bash
python main.py
```

**¿Qué debería ver?**
```
INFO:     Started server process [12345]
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**Importante:** Mantén esta terminal abierta mientras trabajas.

---

---

### PASO 4: Instalar Frontend

Abre otra terminal en la carpeta `frontend`:

```bash
cd frontend
npm install
npm run dev
```

Abre tu navegador en: `http://localhost:5173`

---

## ✨ Primeros Pasos

### 1. Registrarse

- Click en **"Registrarse"**
- Completa el formulario:
  - **Usuario:** Mínimo 3 caracteres
  - **Email:** Email válido
  - **Contraseña:** Mínimo 12 caracteres con mayús, minús, número y símbolo
  - Ejemplo: `MiPassword@123!`
- Click en **"Registrarse"**

### 2. Iniciar Sesión

- Click en **"Iniciar Sesión"**
- Ingresa usuario y contraseña
- ¡Acceso otorgado!

### 3. Crear un Álbum

- Ve a **"Mi Galería"**
- Click en **"Nuevo Álbum"**
- Completa:
  - **Título:** Nombre descriptivo
  - **Descripción:** Opcional
  - **Público:** Marca para que otros vean
- Click en **"Crear"**

### 4. Subir Imágenes

- Entra al álbum
- Click en **"Subir Imagen"**
- Selecciona archivo (máx 10MB)
- Espera análisis
- Resultado: ✅ **Limpia** o ⚠️ **Sospechosa**

Si es sospechosa → pasa a cuarentena para revisión de supervisor

---

## 🏗️ Arquitectura Detallada

### Estructura Completa del Proyecto

```
esteganografia_galeria/
│
├── backend/                               [🐍 FastAPI REST API]
│   ├── main.py                            ⭐ Punto de entrada
│   ├── requirements.txt                   📦 Dependencias Python
│   ├── .env                               🔐 Configuración
│   │
│   ├── config/
│   │   └── config.py                      ⚙️ Variables de configuración
│   │
│   ├── database/
│   │   ├── database.py                    🔌 Conexión SQLAlchemy
│   │   ├── models.py                      📊 Modelos ORM
│   │   └── init_db.py                     🗄️ Inicialización BD
│   │
│   ├── routers/
│   │   ├── auth_router.py                 🔑 Endpoints: Registro/Login
│   │   ├── album_router.py                📁 Endpoints: Álbumes
│   │   ├── image_router.py                🖼️ Endpoints: Subir/Analizar
│   │   └── gallery_router.py              🎞️ Endpoints: Galería pública
│   │
│   ├── services/
│   │   ├── auth_service.py                🛡️ Lógica autenticación
│   │   ├── album_service.py               💼 Lógica álbumes
│   │   ├── image_service.py               🔍 Lógica imágenes
│   │   └── gallery_service.py             📸 Lógica galería
│   │
│   ├── security/
│   │   ├── auth.py                        🔐 JWT + Hashing
│   │   ├── middleware.py                  🛡️ CORS + Headers + Rate Limit
│   │   └── steganography.py               🔎 4 algoritmos detección
│   │
│   ├── uploads/                           📁 Imágenes almacenadas
│   └── test.db                            🗄️ Base de datos SQLite
│
├── frontend/                              [⚛️ React + TypeScript]
│   ├── src/
│   │   ├── components/                    🧩 Componentes React
│   │   │   ├── Navbar.tsx                 🎬 Barra de navegación
│   │   │   ├── LoginForm.tsx              📝 Formulario login
│   │   │   ├── AlbumModal.tsx             🎨 Modal crear álbum
│   │   │   ├── ImageLightbox.tsx          🎞️ Visor de imágenes
│   │   │   └── ProtectedRoute.tsx         🔐 Rutas protegidas
│   │   │
│   │   ├── pages/                         📄 Páginas principales
│   │   │   ├── HomePage.tsx               🏠 Página inicio
│   │   │   ├── LoginPage.tsx              🔑 Página login
│   │   │   ├── GalleryPage.tsx            🎞️ Mi galería
│   │   │   ├── AlbumDetailPage.tsx        📁 Detalle álbum
│   │   │   └── AdminPage.tsx              🛠️ Panel admin
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                     🔗 Cliente HTTP (Axios)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts                 🔐 Hook autenticación
│   │   │   ├── useGallery.ts              🎨 Hook galería
│   │   │   └── useUser.ts                 👤 Hook usuario
│   │   │
│   │   ├── store/
│   │   │   └── authStore.ts               🏪 Estado global (Zustand)
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                   📘 Tipos TypeScript
│   │   │
│   │   ├── utils/
│   │   │   └── helpers.ts                 🧰 Funciones auxiliares
│   │   │
│   │   ├── App.tsx                        🎯 Componente raíz
│   │   ├── main.tsx                       ⚡ Punto entrada Vite
│   │   └── index.css                      🎨 Tailwind CSS
│   │
│   ├── package.json                       📦 Dependencias Node
│   ├── tsconfig.json                      ⚙️ Config TypeScript
│   ├── vite.config.ts                     ⚙️ Config Vite
│   ├── tailwind.config.js                 🎨 Config Tailwind
│   ├── postcss.config.js                  🎨 Config PostCSS
│   └── .env                               🔐 Variables entorno
│
├── README.md                              📖 Este archivo
├── QUICKSTART.md                          ⚡ Inicio rápido
├── API_ADMIN_REFERENCE.md                 📚 Referencia API
├── PROJECT_STATUS.md                      📊 Estado proyecto
├── FEATURES.md                            ✨ Características
├── CHANGELOG.md                           📝 Historial versiones
└── .git/                                  🔄 Control de versiones
```

### Flujo de Datos

```
USUARIO
  ↓
[Frontend - React]
  ├─→ Componentes UI (React)
  ├─→ Validación local
  ├─→ Zustand (Estado global)
  └─→ Axios (HTTP Client)
        ↓
  [Backend - FastAPI]
    ├─→ Middleware (CORS, Rate Limit, Security)
    ├─→ Router (Validación)
    ├─→ Service (Lógica negocio)
    ├─→ Database (SQLAlchemy ORM)
    │   └─→ SQLite
    └─→ Security (JWT, Hashing, Steganography)
        ↓
    [Response con estado]
        ↓
  [Frontend - Actualiza UI]
    └─→ Usuario ve resultado
```

### Ciclo de Vida: Subida de Imagen

```
1️⃣ Usuario selecciona imagen
   ├─ Frontend valida: ¿Max 10MB?
   └─ ¿Formato válido?

2️⃣ Frontend envía POST /api/images/upload
   ├─ Headers: Authorization: Bearer {JWT}
   ├─ Body: FormData con imagen

3️⃣ Backend recibe en image_router.py
   ├─ Middleware valida: ¿Token válido?
   ├─ ¿IP dentro de rate limit?
   └─ Service guarda archivo en uploads/

4️⃣ Backend ejecuta steganography.py
   ├─ Algoritmo 1: LSB Analysis (25%)
   ├─ Algoritmo 2: Histogram (20%)
   ├─ Algoritmo 3: EOF Detection (15%)
   └─ Algoritmo 4: Frequency Domain (40%)

5️⃣ Backend calcula score
   ├─ score < 0.4 → CLEAN ✅
   └─ score > 0.4 → QUARANTINE ⚠️

6️⃣ Backend guarda en Base de Datos
   ├─ Image: metadata, filename, owner
   ├─ ImageMetadata: análisis, score
   └─ SecurityLog: auditoria

7️⃣ Frontend recibe respuesta
   ├─ Actualiza UI
   └─ Muestra estado: ✅ o ⚠️
```

---

## 🔐 Seguridad Implementada (8 Capas)

### Capa 1: Autenticación
- ✅ JWT con expiración 30 minutos
- ✅ Argon2 para hashing de contraseñas (GPU-resistant)
- ✅ Contraseñas validadas: 12+ chars, mayús, minús, número, símbolo
- ✅ Token en localStorage (frontend)

### Capa 2: Autorización
- ✅ Roles: Usuario, Supervisor, Admin
- ✅ Endpoints protegidos por get_current_user()
- ✅ Validación granular por endpoint
- ✅ Album owner check antes de editar

### Capa 3: Rate Limiting
- ✅ SlowAPI: 100 req/min por IP por defecto
- ✅ Login: 5 intentos / 15 minutos
- ✅ Upload: 10 imágenes / hora
- ✅ Bloqueo temporal después de límite

### Capa 4: CORS & Headers
- ✅ CORS: Solo localhost:5173 en desarrollo
- ✅ X-Frame-Options: DENY (anti-clickjacking)
- ✅ X-Content-Type-Options: nosniff
- ✅ Strict-Transport-Security (HTTPS en producción)
- ✅ Content-Security-Policy

### Capa 5: Input Validation
- ✅ Validación de tipos en todos los endpoints
- ✅ Sanitización de strings
- ✅ File type checking (magic bytes)
- ✅ Size limits (10MB por imagen)
- ✅ Pydantic models para validación automática

### Capa 6: SQL Injection Prevention
- ✅ SQLAlchemy ORM (prepared statements)
- ✅ Parametrized queries
- ✅ No SQL raw strings interpoladas
- ✅ Type-safe queries

### Capa 7: Detection & Logging
- ✅ SecurityLog table para auditoria
- ✅ Detección de patrones maliciosos:
  - SQL injection attempts
  - XSS payloads
  - Path traversal
  - Common attack tools
- ✅ IP logging en intentos fallidos

### Capa 8: Steganography Detection
- ✅ LSB (Least Significant Bit) Analysis
- ✅ Histogram Discontinuity Detection
- ✅ EOF (End-of-File) Analysis
- ✅ Frequency Domain Analysis (FFT/DCT)
- ✅ Weighted scoring system
- ✅ Automatic quarantine > 0.4 score

---

## Seguridad

### Características de Seguridad Implementadas

| Característica | ¿Qué es? | ¿Por qué? |
|---|---|---|
| **JWT** | Tokens seguros para autenticación | Evita que otros se hagan pasar por ti |
| **Argon2** | Cifrado de contraseñas | Las contraseñas no se guardan en texto plano |
| **Rate Limiting** | Limita intentos de login | Previene ataques de fuerza bruta |
| **CORS** | Control de origen cruzado | Solo el frontend autorizado puede acceder |
| **HTTPS (producción)** | Conexión encriptada | Protege datos en tránsito |
| **Headers de Seguridad** | Encabezados HTTP seguros | Protege contra ataques comunes |

---

## Comandos Útiles

### Backend
```bash
# Iniciar servidor
python main.py

# Ver logs en tiempo real
python main.py --reload

# Regenerar tablas locales
python -m database.init_db

# Acceder a documentación de API
# Abre en el navegador: http://localhost:8000/docs
```

### Frontend
```bash
# Desarrollo (con hot reload)
npm run dev

# Construir para producción
npm run build

# Ver build localmente
npm run preview

# Verificación de tipos
npm run type-check

# Linting
npm run lint
```

---

## 🐛 Troubleshooting

### "Error conectando a la base de datos"
```bash
# Regenerar base de datos SQLite
cd backend
python -m database.init_db
```

### "Cannot GET /api/..."
```bash
# Verificar que backend está corriendo en 8000
curl http://localhost:8000/health

# Si no responde, reinicia:
cd backend && python main.py
```

### "CORS Error"
```bash
# Verificar VITE_API_URL en frontend/.env
VITE_API_URL=http://localhost:8000/api

# Reiniciar ambos servicios
```

### "npm/python: comando no encontrado"
- Verifica que Node.js y Python estén instalados
- En Windows: Agregalosal PATH durante instalación
- Ejecuta: `node --version` y `python --version`

### "Token expired"
- Se redirige automáticamente a /login
- Inicia sesión de nuevo para obtener nuevo token

---

## ❓ Preguntas Frecuentes

**¿Cuántas imágenes puedo subir?**
- Límite de 10MB por imagen (configurable en `.env`)
- Sin límite en cantidad total

**¿Qué formatos son soportados?**
- JPEG, PNG, GIF, WebP, BMP y formatos estándar

**¿Se comprimen las imágenes?**
- No, se guardan en tamaño original

**¿Qué es "Cuarentena"?**
- Aislamiento de imágenes sospechosas de esteganografía
- Requiere revisión de supervisor

**¿Qué rol necesito para revisar imágenes?**
- Supervisor o Admin

**¿Puedo cambiar mi contraseña?**
- Contacta con un administrador

**¿Son mis datos privados?**
- Sí, cada usuario ve solo sus datos
- Galerías públicas visibles para todos

**¿Cuánto tarda el análisis?**
- Típicamente 1-5 segundos por imagen

---

## 📚 Documentación Adicional

- **[QUICKSTART.md](QUICKSTART.md)** - Guía de inicio rápido (5 minutos)
- **[API_ADMIN_REFERENCE.md](API_ADMIN_REFERENCE.md)** - Referencia endpoints administrativos
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Estado y roadmap del proyecto
- **[FEATURES.md](FEATURES.md)** - Lista completa de características
- **[CHANGELOG.md](CHANGELOG.md)** - Historial de versiones
- **[backend/README.md](backend/README.md)** - Documentación del backend
- **[frontend/README.md](frontend/README.md)** - Documentación del frontend

---

## 🎓 Propósito Educativo

Este proyecto fue desarrollado con **fines educativos** para aprender:

✅ Desarrollo Full Stack (Python + React)  
✅ Autenticación y Autorización JWT  
✅ Procesamiento y análisis de imágenes  
✅ Algoritmos criptográficos y detección  
✅ Diseño de APIs REST seguras  
✅ Gestión de bases de datos  
✅ Buenas prácticas de seguridad  
✅ Arquitectura de aplicaciones web  

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios significativos:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -am 'Agregar mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo [LICENSE](LICENSE) para detalles.

---

## 📞 Contacto & Soporte

- **Reportar Bugs:** Abre un [issue en GitHub](https://github.com/BrayanJac/esteganografia_galeria/issues)
- **Sugerencias:** Discusiones en GitHub
- **Documentación:** Consulta el wiki del proyecto

---

## 🙏 Agradecimientos

Gracias a todos los contribuyentes y usuarios de esta plataforma.

---

**Última Actualización:** Mayo 2026

**Versión:** 1.0.0

**Estado:** ✅ Producción

---

¡Disfruta usando **SecureGallery**! 🎉
