# Laboratorio local para las pruebas de ejecución

Entorno y procedimiento comunes a las verificaciones D1, D2 y D3. El código
probado es el del commit `774d070`: el `backend/` de la carpeta de trabajo no
tiene diferencias con ese commit (`git diff --stat 774d070 -- backend` vacío).

## Entorno

| Elemento | Versión |
| --- | --- |
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Python (venv del backend) | 3.11.9 |
| FastAPI / Starlette / Uvicorn | 0.104.1 / 0.27.0 / 0.24.0.post1 |
| SQLAlchemy | 2.0.55 |
| python-jose / passlib / argon2-cffi | 3.5.0 / 1.7.4 / 23.1.0 |
| Pillow / numpy | 10.1.0 / 1.25.2 |
| slowapi / python-dotenv | 0.1.10 / 1.2.4 |
| Node / npm | 22.14.0 / 11.2.0 (el frontend no interviene en estas pruebas) |
| Cliente HTTP | `urllib` de Python y `curl.exe` de Windows |

## Configuración del laboratorio

- **Backend** en `http://127.0.0.1:8001`. Se usa el 8001 porque el 8000 ya
  estaba ocupado por otros procesos de la máquina.
- **Base y carpeta de subidas propias**, en `%TEMP%\galeria-lab-p1\lab.db` y
  `%TEMP%\galeria-lab-p1\uploads`, mediante `DATABASE_URL` y `UPLOAD_DIR`.
  No se tocan `backend/test.db` ni `backend/uploads/`, y cada corrida empieza
  desde cero.
- **El resto de la configuración sale de `backend/.env`**, por ejemplo
  `SECRET_KEY` y `LOGIN_ATTEMPTS_LIMIT=5`. No se copia ningún valor secreto en
  esta carpeta.
- **Variable `SECRET_KEY` de Windows:** la cuenta de usuario de la máquina de
  pruebas tiene una variable de entorno `SECRET_KEY`. python-dotenv no
  sobrescribe variables existentes, así que con ella el servidor ignora el
  `.env`. El script la quita **solo en su propio proceso** para probar la
  configuración que define el proyecto. Ver la explicación en D1.
- **Datos sintéticos:** usuarios `lab_admin`, `lab_super`, `lab_d1`, `lab_d2` y
  `lab_d3`, con correo `@example.org`, e imágenes generadas por el propio script.
- **Admin:** se crea directamente en la base (`preparar_lab.py`), que es la
  única vía que admite la app. El supervisor se crea con la API del admin.
- **Tablas:** `main.py` define `lifespan` con `create_tables()`, pero no lo pasa
  a `FastAPI(...)`, así que las tablas no se crean al arrancar.
  `preparar_lab.py` las crea.

## Cómo repetir todas las pruebas

Desde la raíz del repositorio, con las dependencias de `backend/venv`
instaladas:

```powershell
powershell -ExecutionPolicy Bypass -File docs\p1\evidencias\00_laboratorio\ejecutar_todo.ps1
```

El script levanta el backend aislado, ejecuta `preparar_lab.py` y las tres
verificaciones, repite D3 con `curl`, guarda cada salida en `salida_*.txt`
dentro de su carpeta y apaga el servidor. Tarda unos 3 minutos, porque
`/login` (10/min) y `/register` (5/min) tienen límite de peticiones: cuando
responde 429, el script espera 61 s y repite la petición (se ve en la salida).

| Archivo | Función |
| --- | --- |
| `ejecutar_todo.ps1` | Orquesta la corrida completa |
| `preparar_lab.py` | Crea las tablas, el admin (en la base) y el supervisor (por la API) |
| `comun.py` | Cliente HTTP mínimo, credenciales sintéticas y multipart |
| `salida_preparar_lab.txt` | Salida de la última corrida |
