# Revisión de código estático (SAST) – commit `774d070`

Esta carpeta documenta la revisión estática de la Galería Segura. Se hizo
**antes** de las pruebas de ejecución y sirve para dos cosas: ubicar cada
debilidad con archivo y línea, y decidir cuáles pasan a verificarse en el
laboratorio. Ninguna alerta de esta carpeta se presenta como evidencia por sí
sola: cada una se leyó en el código y se clasificó a mano (sección 4), y las
verificadas se comprueban en ejecución en las carpetas `D1_…`, `D2_…` y `D3_…`.

| Dato | Valor |
| --- | --- |
| Commit analizado | `774d070` ("ultimos readme"). El siguiente, `dc66cee`, solo borra `frontend/.env`; el código de backend y frontend es idéntico. |
| Herramienta | Semgrep OSS 1.181.0 |
| Entorno de ejecución | Ubuntu 24.04 en WSL 2 (Windows 11), Python 3.12.3. Semgrep nativo de Windows no arrancó, por eso se usa WSL. |
| Fecha | 2026-10-20 |
| Alcance | Copia limpia del commit (`git archive`): 79 archivos versionados, sin `venv/`, `node_modules/`, `.env` ni `test.db` |

---

## 1. Método

1. Exportar el commit a una carpeta limpia para analizar exactamente lo
   versionado, sin cambios locales.
2. **Pasada 1, reglas comunitarias:** los conjuntos genéricos del registro de
   Semgrep para Python, JavaScript, TypeScript, React, secretos y OWASP Top 10.
3. **Revisión manual** de los archivos que tocan los activos A1–A6
   (`config/config.py`, `security/auth.py`, `services/auth_service.py`,
   `routers/*.py`, `services/gallery_service.py`, `services/image_service.py`,
   `security/middleware.py`, `main.py`, almacenamiento del token en el frontend).
4. **Pasada 2, reglas propias:** cada sospecha de la revisión manual se escribió
   como regla de Semgrep (sección 5). Así la búsqueda es repetible y además
   recorre todo el código, no solo el archivo donde se vio el problema.
5. **Triaje manual** de cada resultado: verdadero positivo, falso positivo o
   hipótesis, con su justificación (sección 4).

## 2. Cómo reproducirlo

En WSL o Linux, desde la raíz del repositorio:

```bash
# Instalar Semgrep en un entorno aislado (una sola vez)
python3 -m venv ~/semgrep-venv && ~/semgrep-venv/bin/pip install semgrep==1.181.0

# Copia limpia del commit analizado
rm -rf /tmp/p1-774d070 && mkdir -p /tmp/p1-774d070
git archive 774d070 | tar -x -C /tmp/p1-774d070

# Extraer las reglas propias de este README (bloque de la sección 5)
awk '/^```yaml reglas-p1/{f=1;next} /^```/{f=0} f' docs/p1/evidencias/sast/README.md > /tmp/reglas-p1.yml

cd /tmp/p1-774d070

# Pasada 1: reglas comunitarias
~/semgrep-venv/bin/semgrep scan --metrics=off \
  --config p/python --config p/javascript --config p/typescript \
  --config p/react --config p/secrets --config p/owasp-top-ten .

# Pasada 2: reglas propias
~/semgrep-venv/bin/semgrep scan --metrics=off --config /tmp/reglas-p1.yml .
```

Si Ubuntu no trae `python3-venv`, se puede crear el entorno con
`python3 -m venv --without-pip ~/semgrep-venv` y añadir pip con el instalador
oficial `https://bootstrap.pypa.io/get-pip.py`.

## 3. Resultados

| Pasada | Reglas | Archivos | Hallazgos |
| --- | --- | --- | --- |
| 1. Comunitarias | 269 | 79 | **0** |
| 2. Propias | 7 | 55 (los archivos Python/TS/JS de los 79) | **20** |

Salida de la pasada 1: `Ran 269 rules on 79 files: 0 findings.`
Salida de la pasada 2: `Ran 7 rules on 55 files: 20 findings.`

**Lectura del resultado:** las reglas genéricas no detectan ninguna de las
debilidades del modelo de amenazas. Son defectos de lógica y de diseño
(autorización, bloqueo de cuentas, configuración por defecto), no patrones
sintácticos conocidos. Esto confirma que la alerta automática no basta. Los
hallazgos salen de la revisión manual, y Semgrep solo los vuelve repetibles y
comprobables en todo el código.

## 4. Triaje de los 20 hallazgos de la pasada 2

VP = verdadero positivo · FP = falso positivo · HIP = hipótesis pendiente de
verificar en ejecución.

| # | Regla | Archivo:línea | Código | Clasificación | Justificación tras leer el código | Escenario |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | `p1-secreto-por-defecto` | `backend/config/config.py:10` | `SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")` | **VP** | Si falta la variable, los JWT se firman con esta cadena pública. Además, el `backend/.env` del laboratorio define `SECRET_KEY` con el mismo valor que `backend/.env.example:5` (comprobado comparando ambos valores sin imprimirlos; 55 caracteres). La clave efectiva es pública en ambos casos. El `.env` nunca se versionó (`git log --all -- backend/.env` vacío). | E1 → D1 |
| S2 | `p1-bloqueo-sin-desbloqueo-automatico` | `backend/security/auth.py:119` | `user.is_active = False` | **VP (con matiz)** | Al llegar a `LOGIN_ATTEMPTS_LIMIT` (5, `config.py:27`) la cuenta se desactiva. La ventana de 15 min (`auth.py:110-112`) solo pone el contador a 0, y nunca se llega a ella con la cuenta bloqueada porque `auth.py:96` retorna antes. **Matiz:** sí existe un desbloqueo **manual** en `POST /api/admin/users/{id}/unlock` (`admin_router.py:54-72`). La denegación de servicio no es literalmente permanente, pero no hay desbloqueo automático y un anónimo puede volver a bloquear la cuenta con 5 peticiones cada vez que el admin la libera. | E2 → D2 |
| S3 | `p1-ruta-sin-autenticacion` | `backend/routers/gallery_router.py:21` | `@router.get("/uploads/{filename}")` | **VP** | Sin `get_current_user`. `serve_image` (`gallery_service.py:87-103`) no consulta la base de datos. Las imágenes en cuarentena se guardan en la misma carpeta `UPLOAD_DIR` que las aprobadas (`image_service.py:149-150`): solo cambia el `status` en la base. Contraste: `/gallery` y `/gallery/{id}` (S4) sí filtran por `APPROVED` + `is_public`, y esta ruta no. | E4 → D3 |
| S4 | `p1-ruta-sin-autenticacion` | `backend/routers/gallery_router.py:11` y `:16` | `/gallery`, `/gallery/{album_id}` | FP | Públicas por diseño. Filtran `status == APPROVED` y `is_public == True`, y solo listan imágenes `CLEAN`/`APPROVED` (`gallery_service.py:21-61`). | — |
| S5 | `p1-ruta-sin-autenticacion` | `backend/routers/auth_router.py:15` y `:21` | `/register`, `/login` | FP | Deben ser anónimas. Tienen límite de peticiones de slowapi (5/min y 10/min). | — |
| S6 | `p1-ruta-sin-autenticacion` | `backend/main.py:70` | `/health` | FP | Comprobación de salud; solo devuelve el estado y si la base responde. | — |
| S7 | `p1-ruta-sin-autenticacion` | `backend/main.py:82` | `/internal/db_tables` | **VP (nuevo, bajo)** | Ruta "interna" sin autenticación que devuelve los nombres de todas las tablas de la base. Es una fuga de información de bajo impacto, pero ayuda a planear E5. No estaba en el modelo inicial; se registra como escenario adicional. | E7 (nuevo) |
| S8 | `p1-ruta-de-archivo-sin-normalizar` | `backend/services/gallery_service.py:87-88` | `file_path = os.path.join(UPLOAD_DIR, filename)` | **HIP** | No hay `realpath`/`commonpath` ni lista de caracteres permitidos. El parámetro de ruta de FastAPI (`{filename}`) no acepta `/`, pero en Windows `os.path.join` también trata `\` como separador. Solo se confirmaría en ejecución, contra un archivo inofensivo colocado por el autor. | E5 |
| S9 | `p1-mensaje-revela-estado-de-cuenta` | `backend/services/auth_service.py:39-41` | `"El nombre de usuario o email ya existe"` (409) | **VP** | El registro es anónimo y responde 409 solo si el usuario o correo existe: permite enumerar cuentas. | E3 |
| S10 | `p1-mensaje-revela-estado-de-cuenta` | `backend/services/auth_service.py:66-71` | `"Usuario bloqueado por demasiados intentos fallidos…"` | **VP** | El login da un mensaje distinto a una cuenta bloqueada y a una inexistente (`"Credenciales inválidas"`). Confirma que la cuenta existe y que el ataque E2 funcionó. | E3, E2 |
| S11 | `p1-mensaje-revela-estado-de-cuenta` | `backend/services/auth_service.py:131` | `"El nombre de usuario o email ya existe"` en `create_supervisor` | FP | Mismo mensaje, pero la ruta exige rol admin (`auth_router.py:52-59`); un anónimo no puede usarla para enumerar. | — |
| S12 | `p1-mensaje-revela-estado-de-cuenta` | `backend/security/auth.py:158-161` | `"La cuenta está bloqueada"` (403) | FP | Está en `get_current_user`: solo responde a quien ya presenta un token válido. No sirve para enumerar. | — |
| S13 | `p1-csp-permisiva` | `backend/security/middleware.py:25` (también se marcan `:22`, `:26` y `:34`, que son la misma cadena) | `script-src 'self' 'unsafe-inline' 'unsafe-eval' …` | **VP / HIP** | La configuración débil es real: permite scripts en línea y `eval`, lo que anula gran parte de la protección contra XSS. Las 4 coincidencias son una sola política. Que sea explotable depende de encontrar un punto de XSS (HIP). Además, la CSP la pone el backend; las páginas del frontend que sirve Vite en `:5173` no la reciben, y `index.html` no define una CSP propia. | E6 |
| S14 | `p1-token-en-localstorage` | `frontend/src/components/LoginForm.tsx:45` | `localStorage.setItem('access_token', token)` | **VP / HIP** | El JWT queda accesible desde cualquier script de la página. El robo requiere XSS o una dependencia comprometida (HIP). | E6 |
| S15 | `p1-token-en-localstorage` | `frontend/src/store/authStore.ts:21` | `localStorage.setItem('access_token', token)` | **VP / HIP** | Mismo patrón, en el store de Zustand. | E6 |

Total: 20 coincidencias de Semgrep, agrupadas en 15 filas (S4, S5 y S13
reúnen varias líneas): **9 filas VP** (en S13–S15 la configuración débil es
real, pero explotarla depende de un XSS), **5 falsos positivos** y
**1 hipótesis**.

### Correspondencia con el informe

| Debilidad del informe | Hallazgo SAST | Estado tras la revisión estática | Verificación en ejecución |
| --- | --- | --- | --- |
| D1 – Secreto de firma por defecto (E1) | S1 | Confirmada en el código y en la configuración del laboratorio | **Verificada**: un token fabricado con la clave de `.env.example` es aceptado (HTTP 200). Ver [D1_secreto_por_defecto](../D1_secreto_por_defecto/README.md) |
| D2 – Bloqueo de cuentas (E2) | S2, S10 | Confirmada en el código; **hay que corregir la redacción**: existe desbloqueo manual por admin, pero no automático | **Verificada**: `is_active=0` con 5 intentos; sigue bloqueada tras la ventana. Ver [D2_bloqueo_de_cuentas](../D2_bloqueo_de_cuentas/README.md) |
| D3 – Archivos sin control de acceso (E4) | S3 | Confirmada en el código | **Verificada**: imagen en cuarentena de un álbum privado descargada sin token (HTTP 200, mismo SHA-256). Ver [D3_uploads_sin_autenticacion](../D3_uploads_sin_autenticacion/README.md) |
| E5 – Ruta sin normalizar | S8 | Hipótesis | Solo con un archivo inofensivo propio |
| E6 – Token en localStorage + CSP | S13, S14, S15 | Configuración débil confirmada; explotación hipotética | Requiere un XSS real |
| E3 – Enumeración de usuarios | S9, S10 | Confirmada en el código | Opcional: comparar respuestas de `/register` y `/login` |
| E7 – `/internal/db_tables` público (nuevo) | S7 | Confirmada en el código | Opcional: `curl http://localhost:8000/internal/db_tables` |

## 5. Reglas propias

Cada regla codifica una sospecha de la revisión manual. El bloque se extrae
tal cual con el comando `awk` de la sección 2.

```yaml reglas-p1
rules:
  - id: p1-secreto-por-defecto
    languages: [python]
    severity: ERROR
    message: >-
      $NAME tiene un valor por defecto escrito en el código; si falta en el
      .env la app firma los JWT con una clave conocida (E1).
    patterns:
      - pattern: os.getenv("$NAME", "$DEFAULT")
      - metavariable-regex:
          metavariable: $NAME
          regex: ^(SECRET_KEY|.*_SECRET|.*_API_KEY|JWT_.*KEY)$

  - id: p1-bloqueo-sin-desbloqueo-automatico
    languages: [python]
    severity: WARNING
    message: >-
      $FUNC desactiva la cuenta y nunca la reactiva; la ventana de tiempo
      solo reinicia el contador (E2).
    patterns:
      - pattern: $U.is_active = False
      - pattern-inside: |
          def $FUNC(...):
            ...
      - pattern-not-inside: |
          def $FUNC(...):
            ...
            $U.is_active = True
            ...

  - id: p1-ruta-sin-autenticacion
    languages: [python]
    severity: WARNING
    message: >-
      $FUNC ($PATH) no declara ninguna dependencia de autenticación
      (get_current_user / require_*). Confirmar si debe ser pública (E4).
    patterns:
      - pattern: |
          @$ROUTER.$METHOD($PATH, ...)
          async def $FUNC(...):
            ...
      - metavariable-regex:
          metavariable: $METHOD
          regex: ^(get|post|put|patch|delete)$
      - pattern-not: |
          @$ROUTER.$METHOD($PATH, ...)
          async def $FUNC(..., $P = Depends(get_current_user), ...):
            ...
      - pattern-not: |
          @$ROUTER.$METHOD($PATH, ...)
          async def $FUNC(..., $P = Depends(require_supervisor_or_admin), ...):
            ...
      - pattern-not: |
          @$ROUTER.$METHOD($PATH, ...)
          async def $FUNC(..., $P = Depends($REQ(...)), ...):
            ...
      - pattern-not: |
          @$ROUTER.$METHOD($PATH, ...)
          async def $FUNC(..., $P: Annotated[$T, Depends(get_current_user)], ...):
            ...
      - pattern-not: |
          @$ROUTER.$METHOD($PATH, ...)
          async def $FUNC(..., $P: Annotated[$T, Depends(require_supervisor_or_admin)], ...):
            ...
      - pattern-not: |
          @$ROUTER.$METHOD($PATH, ...)
          async def $FUNC(..., $P: Annotated[$T, Depends($REQ(...))], ...):
            ...

  - id: p1-ruta-de-archivo-sin-normalizar
    languages: [python]
    severity: WARNING
    message: >-
      $FUNC une $DIR con '$NAME' recibido del cliente y lo entrega con
      FileResponse sin comprobar que la ruta final quede dentro de $DIR (E5).
    patterns:
      - pattern: |
          def $FUNC(..., $NAME, ...):
            ...
            $PATH = os.path.join($DIR, $NAME)
            ...
            return FileResponse($PATH, ...)
      - pattern-not: |
          def $FUNC(..., $NAME, ...):
            ...
            os.path.realpath(...)
            ...
      - pattern-not: |
          def $FUNC(..., $NAME, ...):
            ...
            $X = os.path.realpath(...)
            ...

  - id: p1-mensaje-revela-estado-de-cuenta
    languages: [python]
    severity: INFO
    message: >-
      El mensaje de error revela si la cuenta existe o está bloqueada:
      "$MSG" (E3).
    patterns:
      - pattern: raise HTTPException(..., detail="$MSG", ...)
      - metavariable-regex:
          metavariable: $MSG
          regex: (?i).*(ya existe|bloquead).*

  - id: p1-csp-permisiva
    languages: [python]
    severity: WARNING
    message: La CSP permite 'unsafe-inline' o 'unsafe-eval' (E6).
    patterns:
      - pattern: '"$S"'
      - metavariable-regex:
          metavariable: $S
          regex: .*'unsafe-(inline|eval)'.*

  - id: p1-token-en-localstorage
    languages: [typescript, javascript]
    severity: WARNING
    message: >-
      El token de sesión se guarda en localStorage, legible por cualquier
      script de la página (E6).
    patterns:
      - pattern: localStorage.setItem("$K", ...)
      - metavariable-regex:
          metavariable: $K
          regex: (?i).*token.*
```

**Límites de las reglas:** son reglas a medida para este repositorio. La de
rutas reconoce solo las dependencias de autenticación que usa este proyecto
(`get_current_user`, `require_*`), y la de mensajes busca frases concretas en
español. No sustituyen la revisión manual; la hacen repetible.
