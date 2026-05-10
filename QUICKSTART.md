# ⚡ Quick Start Guide

**Inicia el proyecto en 5 minutos** 🚀

---

## 📦 Requisitos Previos

```bash
# Verificar versiones
node --version    # v16+
python --version  # 3.8+
git --version     # Cualquier versión
```

Si no tienes instalados, descarga desde:
- [Node.js](https://nodejs.org/)
- [Python](https://www.python.org/)

---

## 🚀 Setup en 1-2-3

### 1️⃣ Clonar Repositorio
```bash
git clone https://github.com/BrayanJac/esteganografia_galeria.git
cd esteganografia_galeria
```

### 2️⃣ Backend Setup (Terminal 1)
```bash
cd backend
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
python main.py
```

✅ Backend listo en: `http://localhost:8000`

### 3️⃣ Frontend Setup (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

✅ Frontend listo en: `http://localhost:5173`

---

## 🔑 Test Credentials

### Admin Account
```
Username: admin
Password: admin123
```

### Supervisor Account
```
Username: supervisor
Password: supervisor123
```

### Regular User
```
Username: user
Password: user123
```

> **Note**: Si no existen, usa el formulario de registro para crear nuevos usuarios.

---

## 📚 Primeros Pasos

### 1. Abrir la App
- Abre [http://localhost:5173](http://localhost:5173) en tu navegador

### 2. Login
- Click "Ingresar"
- Usa credenciales de arriba
- ✅ Autenticado

### 3. Como Usuario Normal
- **Home**: Ver galería pública
- **Mis Álbumes**: Crear/editar álbumes
- **Subir Imagen**: Agregar fotos a un álbum
- **Perfil**: Ver info personal

### 4. Como Supervisor
- **Panel**: Ver álbumes pendientes
- **Cuarentena**: Ver imágenes sospechosas
- **Revisar**: Click en álbum/imagen
- **Comentar**: Escribir + Enter para guardar
- **Aprobar**: Click Aprobar o Rechazar

### 5. Como Administrador
- **Todas las features de Supervisor**
- **Estado**: Ver dashboard administrativo
- **Usuarios**: Click en tiles para ver detalles
- **Eventos**: Separados por ingreso/salida
- **Actividad**: Ver qué hizo cada usuario

---

## 🔧 Comandos Útiles

### Backend
```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python main.py

# Ver documentación API
# Abre: http://localhost:8000/docs

# Recrear base de datos
python -m database.init_db
```

### Frontend
```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Ver build (preview)
npm run preview

# Linting
npm run lint
```

---

## 📋 Archivos Importantes

```
esteganografia_galeria/
├── README.md                 # Documentación principal
├── CHANGELOG.md             # Historial de cambios
├── FEATURES.md              # Lista de características
├── PROJECT_STATUS.md        # Estado del proyecto
├── API_ADMIN_REFERENCE.md   # Quick reference de admin API
│
├── backend/
│   ├── main.py              # Punto de entrada
│   ├── requirements.txt      # Dependencias Python
│   ├── config/config.py      # Configuración
│   └── README.md            # Docs backend
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── StatusPage.tsx   # Admin Estado (nuevo)
    │   │   └── AdminPage.tsx    # Supervisor panel
    │   └── services/api.ts      # API client
    ├── package.json             # Dependencias Node
    └── README.md               # Docs frontend
```

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Verificar Python
python --version

# Activar venv correctamente
source venv/bin/activate  # macOS/Linux
# o
venv\Scripts\activate  # Windows

# Reinstalar dependencias
pip install -r requirements.txt --upgrade

# Ver puerto 8000 en uso
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows
```

### Frontend error "API connection failed"
```bash
# Verificar backend esté corriendo
curl http://localhost:8000/health

# Revisar VITE_API_URL en .env
cat frontend/.env
# Debe ser: VITE_API_URL=http://localhost:8000/api
```

### Module not found errors
```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
source venv/bin/activate  # o activate.bat en Windows
pip install -r requirements.txt
```

### Puerto ya en uso
```bash
# Cambiar puerto backend
# En backend/main.py cambiar:
# uvicorn.run(..., port=8001)

# Cambiar puerto frontend
# npm run dev -- --port 5174
```

---

## 📸 Características por rol

### 👤 User
- Crear/editar álbumes
- Subir imágenes
- Ver galería pública
- Dejar comentarios (next version)

### 👮 Supervisor
- Todo de User
- Revisar álbumes pendientes
- Revisar imágenes en cuarentena
- Aprobar/rechazar
- Comentarios rápidos (Enter-key)

### 👨‍💼 Admin
- Todo de Supervisor
- Dashboard "Estado"
- Ver usuarios/eventos/actividad
- Gestionar usuarios
- Estadísticas completas

---

## 🔒 Seguridad Básica

- ✅ Tokens JWT expiran en 30 minutos
- ✅ Passwords hasheados
- ✅ CORS configurado
- ✅ Validación en servidor y cliente
- ✅ Detección de esteganografía automática

---

## 💡 Tips

1. **Usar API Swagger**: `http://localhost:8000/docs`
   - Ver todos los endpoints
   - Probar requests directamente
   - Ver modelos de datos

2. **Console del navegador** (F12)
   - Ver requests/responses de API
   - Debugging de errores frontend

3. **Logs del backend**
   - Ver en terminal donde corre `python main.py`
   - Útil para debugging

4. **React DevTools**
   - Instalar extensión [React DevTools](https://react-devtools-tutorial.vercel.app/)
   - Inspeccionar componentes y estado

---

## 📚 Documentación Detallada

| Documento | Contenido |
|-----------|-----------|
| [README.md](README.md) | Overview principal del proyecto |
| [backend/README.md](backend/README.md) | Documentación API backend |
| [frontend/README.md](frontend/README.md) | Documentación frontend |
| [CHANGELOG.md](CHANGELOG.md) | Historial completo de cambios |
| [FEATURES.md](FEATURES.md) | Lista completa de características |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Estado actual del proyecto |
| [API_ADMIN_REFERENCE.md](API_ADMIN_REFERENCE.md) | Quick reference de admin API |

---

## 🚀 Próximos Pasos

1. ✅ Backend corriendo
2. ✅ Frontend corriendo
3. ✅ Login funcionando
4. **Ahora**:
   - Explorar features según tu rol
   - Revisar documentación específica
   - Crear tickets de issues/features
   - Contribuir al proyecto

---

## 🆘 Necesitas Ayuda?

1. **Revisa los READMEs**
   - Responden la mayoría de preguntas

2. **Busca en CHANGELOG**
   - Ver cambios recientes
   - Entender cómo funcionan features

3. **Abre una issue**
   - Describe el problema
   - Incluye pasos para reproducir
   - Adjunta screenshots si es posible

4. **Revisa el código**
   - Los componentes tienen comentarios
   - Functions tienen docstrings

---

## ✨ Happy Coding! 

```
     ___
    / __) 
   ( (__
    \__) Security & Steganography Gallery
```

**Versión**: 1.1.0  
**Última actualización**: Mayo 10, 2026  
**Estado**: ✅ Producción

Para más info: Ver [PROJECT_STATUS.md](PROJECT_STATUS.md)
