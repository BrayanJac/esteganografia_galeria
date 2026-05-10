# SecureGallery - Galería Multimedia Segura

Una aplicación web completa para gestionar galerías de imágenes con detección automática integrada de esteganografía, autenticación segura y sistema de roles de usuario.

## Tabla de Contenidos

1. [¿Qué es SecureGallery?](#qué-es-securegallery)
2. [¿Cómo Funciona?](#cómo-funciona)
3. [Componentes Principales](#componentes-principales)
4. [Requisitos Previos](#requisitos-previos)
5. [Instalación Paso a Paso](#instalación-paso-a-paso)
6. [Primeros Pasos](#primeros-pasos)
7. [Funcionamiento Detallado](#funcionamiento-detallado)
8. [Estructura del Proyecto](#estructura-del-proyecto)
9. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## ¿Qué es SecureGallery?

SecureGallery es una plataforma web que permite:

- **Gestión de Galerías** - Crear, editar y organizar álbumes de fotos
- **Autenticación Segura** - Cada usuario tiene su propia cuenta protegida
- **Detección de Esteganografía** - Analiza automáticamente si las imágenes contienen información oculta
- **Sistema de Roles** - Usuarios normales, supervisores y administradores con diferentes permisos
- **Cuarentena de Imágenes** - Aísla automáticamente imágenes sospechosas
- **Galería Pública** - Comparte tus álbumes públicos con otros

### Conceptos Clave

**¿Qué es la Esteganografía?**
Es la técnica de ocultar información dentro de archivos (como imágenes). Por ejemplo, alguien podría ocultar un archivo de texto dentro de una foto sin que se note a simple vista.

**¿Por qué es importante?**
En contextos de seguridad, es importante detectar si alguien está intentando colarse información oculta en las imágenes que subes.

---

## ¿Cómo Funciona?

### Flujo General

```
Usuario              Navegador              Backend                Base de Datos
  |                    |                     |                          |
  |--- Registrarse -->|                     |                          |
  |                    |--- POST /register ->|--- Guardar usuario ----->|
  |<--- Confirmación --|<--- Token JWT ------|                          |
  |                    |                     |                          |
  |--- Iniciar sesión -|                     |                          |
  |                    |--- POST /login ---->|--- Verificar credenciales|
  |<--- Token JWT ------|<--- Token JWT ------|                          |
  |                    |                     |                          |
  |--- Subir imagen --->|                     |                          |
  |                    |--- POST /upload --->|--- Guardar archivo ----->|
  |                    |                     |--- Analizar imagen ----->|
  |                    |                     |--- Guardar resultado ---->|
  |<--- Resultado ------|<--- Estado imagen--|<--- Estado análisis ------|
```

### Paso a Paso: ¿Qué Ocurre Cuando Subes una Imagen?

1. **Carga** - Seleccionas una imagen en el navegador
2. **Envío** - La imagen se envía al servidor backend
3. **Almacenamiento** - Se guarda en la carpeta `uploads/`
4. **Análisis** - El backend ejecuta algoritmos de detección de esteganografía
5. **Resultado** - Se guarda como "LIMPIA" o "SOSPECHOSA"
6. **Cuarentena** - Si es sospechosa, se aísla automáticamente
7. **Notificación** - Ves el resultado en la galería

---

## Componentes Principales

### 1. Backend (Python + FastAPI)

**¿Qué es?** Es el "cerebro" de la aplicación que se ejecuta en el servidor.

**¿Qué hace?**
- Gestiona usuarios y autenticación
- Procesa las imágenes subidas
- Realiza el análisis de esteganografía
- Almacena datos en la base de datos
- Proporciona APIs REST para que el frontend las use

**Ubicación:** `/backend/`

### 2. Frontend (React + Vite + TypeScript)

**¿Qué es?** Es la interfaz visual que ves en el navegador.

**¿Qué hace?**
- Muestra formularios para login/registro
- Permite subir imágenes
- Muestra la galería con resultados
- Comunica con el backend

**Ubicación:** `/frontend/`

### 3. Base de Datos (SQLite)

**¿Qué es?** Almacena toda la información de manera organizada.

**¿Qué guarda?**
- Información de usuarios
- Detalles de álbumes
- Información de imágenes
- Resultados de análisis

> Nota: en esta versión el proyecto usa SQLite por defecto en local, así que no necesitas instalar PostgreSQL para ejecutar la app. Si cambias la variable `DATABASE_URL`, puedes apuntar a otra base de datos compatible.

## Herramientas y Dependencias

La aplicación está construida con estas tecnologías principales:

- **Backend:** FastAPI, Uvicorn, SQLAlchemy, Pydantic, Python-JOSE, Passlib y SlowAPI
- **Frontend:** React, TypeScript, Vite, TanStack Query, Axios, Zustand, Tailwind CSS y Lucide Icons
- **Persistencia:** SQLite por defecto en desarrollo local

Estas herramientas cubren autenticación, gestión de galerías, validación de formularios, consumo de APIs y renderizado de la interfaz.

---

## Requisitos Previos

Antes de empezar, necesitas tener instalado:

### 1. Python 3.10+
Lenguaje de programación para el backend.
- [Descargar Python](https://www.python.org/downloads/)
- **Verificar instalación:**
  ```bash
  python --version
  ```

### 2. Node.js 18+
Entorno para ejecutar JavaScript/TypeScript del frontend.
- [Descargar Node.js](https://nodejs.org/)
- **Verificar instalación:**
  ```bash
  node --version
  npm --version
  ```

### 3. SQLite
No necesitas instalar nada extra para ejecutar el proyecto en local. La base de datos SQLite se crea automáticamente con el script de inicialización.

Si quieres usar otra base de datos, puedes cambiar `DATABASE_URL` en el archivo `.env`.

### 4. Git (Opcional pero recomendado)
Para clonar el repositorio.
- [Descargar Git](https://git-scm.com/downloads)

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

### PASO 4: Instalar Frontend

#### 4.1 Abre OTRA terminal y entra en la carpeta del frontend
```bash
cd frontend
```

#### 4.2 Instalar dependencias
```bash
npm install
```

#### 4.3 Iniciar el servidor de desarrollo
```bash
npm run dev
```

**¿Qué debería ver?**
```
➜  Local:   http://localhost:5173/
```

#### 4.4 Abre en el navegador
Abre tu navegador favorito y ve a:
```
http://localhost:5173
```

---

## Primeros Pasos

### 1. Registrarse

1. En la página de inicio, click en **"Registrarse"**
2. Completa el formulario:
   - **Usuario:** Tu nombre de usuario (ej: "juan123")
   - **Email:** Tu email (ej: "juan@example.com")
   - **Contraseña:** Mínimo 12 caracteres, incluyendo:
     - Mayúsculas (A-Z)
     - Minúsculas (a-z)
     - Números (0-9)
     - Caracteres especiales (!@#$%^&*)
   - Ejemplo válido: `MiPassword@123!`

3. Click en **"Registrarse"**

### 2. Iniciar Sesión

1. Click en **"Iniciar Sesión"**
2. Ingresa tu usuario y contraseña
3. Click en **"Iniciar Sesión"**

### 3. Crear un Álbum

1. Una vez dentro, ve a **"Mi Galería"**
2. Click en **"Nuevo Álbum"**
3. Completa:
   - **Título:** Nombre del álbum (ej: "Vacaciones 2024")
   - **Descripción:** Descripción opcional
   - **Público:** Marca si quieres que otros lo vean
4. Click en **"Crear"**

### 4. Subir Imágenes

1. En tu álbum, click en **"Subir imagen"**
2. Selecciona imágenes de tu computadora
3. Espera a que se procesen
4. Verás el estado: "Limpia" o "Sospechosa"

---

## Funcionamiento Detallado

### Autenticación (Login/Registro)

```
1. Registro:
   Usuario ----[nombre, email, contraseña]--> Backend
   Backend: "Voy a cifrar la contraseña"
   Backend: "Voy a guardar el usuario en la BD"
   Frontend: "Listo! Ahora inicia sesión"

2. Iniciar Sesión:
   Usuario ----[usuario, contraseña]--> Backend
   Backend: "¿La contraseña coincide?"
   Backend: "Sí! Aquí está tu TOKEN"
   Frontend: "Guardaré el TOKEN para futuras peticiones"

3. Peticiones Futuras:
   Usuario quiere subir imagen
   Frontend: "Adjuntaré el TOKEN al request"
   Backend: "¿Tiene TOKEN válido?"
   Backend: "Sí! Permite la subida"
```

**¿Qué es un TOKEN?**
Es como un pase de acceso. Una vez que inicias sesión, el servidor te da un pase que dice "Este usuario es confiable". Cada vez que haces algo, le muestras el pase.

### Análisis de Imágenes

```
Usuario sube imagen
    ↓
Backend recibe la imagen
    ↓
Backend guarda la imagen en carpeta "uploads/"
    ↓
Backend ejecuta algoritmos de análisis:
  - LSB Steganography (Least Significant Bit)
  - DCT Coefficients (Discrete Cosine Transform)
  - Fourier Analysis
    ↓
Backend calcula un "score de sospecha"
    ↓
Score > 70%? → CUARENTENA (Sospechosa)
Score < 30%? → LIMPIA (Segura)
Score 30-70%? → REQUIERE REVISIÓN (Manual)
    ↓
Resultado se guarda en la Base de Datos
    ↓
Frontend muestra el resultado al usuario
```

### Flujo de Roles

```
USUARIO NORMAL:
├── Crear álbumes propios
├── Subir imágenes
├── Ver su galería
├── Editar sus galerías aprobadas o rechazadas
└── Ver galerías públicas

SUPERVISOR:
├── Todo lo del usuario
├── Revisar imágenes en cuarentena
├── Aprobar/Rechazar álbumes
├── Editar galerías aprobadas o rechazadas
├── Agregar comentarios de revisión
└── Ver panel de administración

ADMIN:
├── Todo lo del supervisor
├── Gestionar usuarios
├── Ver estadísticas
└── Acceso completo a todo
```

---

## Estructura del Proyecto

```
esteganografia_galeria/
│
├── backend/                          [API REST - Python]
│   ├── main.py                       Archivo principal (ejecutar esto)
│   ├── requirements.txt              Dependencias Python
│   ├── .env                          Variables de configuración
│   ├── config/
│   │   └── config.py                 Configuración del app
│   ├── database/
│   │   ├── database.py               Conexión a BD
│   │   └── models.py                 Estructura de datos
│   ├── routers/                      Endpoints de API
│   │   ├── auth_router.py            Login/Registro
│   │   ├── album_router.py           Gestión álbumes
│   │   ├── image_router.py           Gestión imágenes
│   │   └── gallery_router.py         Galería pública
│   ├── services/                     Lógica de negocio
│   │   ├── auth_service.py
│   │   ├── album_service.py
│   │   ├── image_service.py
│   │   └── gallery_service.py
│   ├── security/                     Seguridad
│   │   ├── auth.py                   Autenticación JWT
│   │   ├── middleware.py             CORS, headers
│   │   └── steganography.py          Análisis esteganografía
│   └── uploads/                      Imágenes guardadas
│
├── frontend/                         [Interfaz - React]
│   ├── src/
│   │   ├── components/               Componentes React
│   │   │   ├── Navbar.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ...
│   │   ├── pages/                    Páginas completas
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── GalleryPage.tsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.ts                Cliente HTTP
│   │   ├── hooks/                    Hooks personalizados
│   │   ├── store/                    Estado global
│   │   ├── types/                    Tipos TypeScript
│   │   ├── App.tsx                   Componente raíz
│   │   └── main.tsx                  Punto de entrada
│   ├── package.json                  Dependencias Node
│   ├── vite.config.ts                Configuración Vite
│   └── .env                          Variables de entorno
│
└── README.md                         Este archivo
```

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

## Problemas Comunes y Soluciones

### "Error conectando a la base de datos"

**Causa:** El archivo SQLite local no existe todavía, está corrupto o cambiaste `DATABASE_URL`.

**Solución:**
```bash
cd backend
python -m database.init_db

# Verificar credenciales en .env si apuntaste a otra base de datos
cat .env
```

### "Cannot GET /api/..."

**Causa:** El backend no está ejecutándose.

**Solución:**
```bash
# Verificar que el backend esté ejecutándose - la terminal debe mostrar:
# "INFO:     Application startup complete"

# Si no, inicia el backend:
cd backend
python main.py
```

### "Error CORS"

**Causa:** El frontend y backend no se están comunicando correctamente.

**Solución:**
```bash
# Verificar en el .env del frontend:
VITE_API_URL=http://localhost:8000/api

# Reiniciar ambos servidores:
# Backend: Ctrl+C y python main.py
# Frontend: Ctrl+C y npm run dev
```

### "npm: comando no encontrado"

**Causa:** Node.js no está instalado o no está en PATH.

**Solución:**
```bash
# Descargar e instalar Node.js desde:
https://nodejs.org/

# Verificar después:
node --version
npm --version
```

### "python: comando no encontrado"

**Causa:** Python no está instalado o no está en PATH.

**Solución:**
```bash
# Descargar e instalar Python desde:
https://www.python.org/downloads/

# En Windows: Marca "Add Python to PATH" durante la instalación

# Verificar después:
python --version
```

---

## Preguntas Frecuentes

### ¿Cuántas imágenes puedo subir?
No hay límite definido. El máximo por imagen es 10MB (configurable).

### ¿Qué formatos de imagen son soportados?
JPG, PNG, GIF, BMP, WebP y otros formatos estándar.

### ¿Se comprimen las imágenes?
No, se guardan en su tamaño original.

### ¿Puedo cambiar mi contraseña?
Sí, en el panel de usuario (próxima versión).

### ¿Qué es "Cuarentena"?
Es cuando una imagen es marcada como sospechosa por el análisis y se aísla. Un supervisor debe revisar si realmente contiene esteganografía.

### ¿Qué es un "Rol"?
Es el tipo de usuario. Cada rol tiene permisos diferentes:
- **Usuario:** Puede crear álbumes y subir imágenes
- **Supervisor:** Puede revisar imágenes en cuarentena
- **Admin:** Acceso completo al sistema

### ¿Puedo eliminar mi cuenta?
Aún no, pero puedes contactar con un administrador.

### ¿Son mis datos privados?
Sí, cada usuario solo ve sus propios datos, excepto las galerías públicas.

### ¿Cuánto tiempo tarda el análisis de esteganografía?
Típicamente 1-5 segundos dependiendo del tamaño de la imagen.

### ¿Puedo editar mis galerías?
Sí. Los usuarios pueden editar sus galerías si ya fueron aprobadas o rechazadas. Si una galería sigue pendiente, no se permite editarla.

### ¿Qué puede hacer un supervisor con una galería?
Puede editar galerías aprobadas o rechazadas y agregar comentarios de revisión desde el panel de administración.

### ¿Puedo usar la aplicación sin conexión?
No, requiere una conexión porque utiliza un servidor.

---

## Documentación Adicional

- [Backend README](./backend/README.md) - Documentación detallada del backend
- [Frontend README](./frontend/README.md) - Documentación detallada del frontend
- [Frontend QUICKSTART](./frontend/QUICKSTART.md) - Guía rápida del frontend

---

## Contribución

¿Quieres mejorar el proyecto?

1. **Reporta errores** - Si encuentras un bug, crea un issue
2. **Sugiere mejoras** - ¿Tienes ideas? Queremos escucharlas
3. **Contribuye código** - Fork y envía un pull request

---

## Licencia

Este proyecto está bajo licencia MIT. Eres libre de usarlo, modificarlo y distribuirlo.

---

## Autor

Desarrollado por: **Brayan Jac**

---

## Agradecimientos

- FastAPI - Framework del backend
- React - Librería de UI
- PostgreSQL - Base de datos
- Comunidad open source

---

## Notas Educativas

Este proyecto fue creado con **fines educativos** para aprender:
- Desarrollo full stack
- Seguridad en aplicaciones web
- Procesamiento de imágenes
- Autenticación y autorización
- Bases de datos relacionales
- APIs REST

---

Para preguntas o problemas, consulta la documentación o contacta al equipo de desarrollo.

¡Gracias por usar SecureGallery!
