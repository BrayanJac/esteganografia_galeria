# D1 – Secreto de firma por defecto (E1) · VERIFICADA

**Commit:** `774d070` · **Activos:** A1 (`SECRET_KEY` y JWT), A5 (roles) ·
**Hallazgo SAST:** S1

## Debilidad en el código

`backend/config/config.py:10` escribe en el código una clave de respaldo:

```python
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
```

`backend/.env.example:5`, que está versionado y es público, publica otra:

```
SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
```

`security/auth.py:68` y `:74` firman y validan los JWT con `SECRET_KEY` y HS256.
Quien conoce la clave puede fabricar tokens válidos para cualquier `sub`.

## Pasos para reproducirlo

1. Levantar el laboratorio ([00_laboratorio](../00_laboratorio/README.md)) en
   una consola **sin** variable de entorno `SECRET_KEY`, para que el servidor
   use `backend/.env`.
2. Ejecutar `python ../docs/p1/evidencias/D1_secreto_por_defecto/verificar_d1.py`
   desde `backend/` (o usar `ejecutar_todo.ps1`). El script:
   1. muestra las dos líneas con `SECRET_KEY` (equivalente a
      `grep -n SECRET_KEY config/config.py .env.example`);
   2. compara la clave del `.env` con la de `.env.example` **sin imprimirla**;
   3. registra a `lab_d1`, inicia sesión y decodifica el token;
   4. valida la firma del token emitido con la clave publicada y, como
      control, con una clave aleatoria;
   5. fabrica fuera del servidor un token para el **mismo** usuario sintético,
      firmado con la clave publicada, y llama a `GET /api/auth/me`. Como
      control, hace lo mismo con un token firmado con una clave aleatoria.
      No se fabrican tokens de otros usuarios ni roles.

## Resultado obtenido ([salida_d1.txt](salida_d1.txt))

```
backend/.env == backend/.env.example: True
firma VÁLIDA con la clave de .env.example -> {'sub': 'lab_d1', 'exp': 1792475755}
control: con una clave aleatoria la firma falla -> Signature verification failed.
GET /api/auth/me (token fabricado con la clave de .env.example) -> HTTP 200 {"id":3,"username":"lab_d1",...,"role":"user","is_active":true}
GET /api/auth/me (control: token firmado con clave aleatoria) -> HTTP 401 {"detail":"No se pudieron validar las credenciales"}
```

**Conclusión:** con la configuración del proyecto, el servidor firma con la
clave publicada en el repositorio y acepta tokens fabricados por un tercero.
Cambiar `sub` a `lab_admin` daría acceso de administrador sin su contraseña
(E1). Esto **no** se ejecutó: basta con demostrar que la firma es adivinable.

## Observación: la variable de entorno tiene prioridad

En la primera ejecución
([salida_d1_con_variable_de_usuario.txt](salida_d1_con_variable_de_usuario.txt))
el token **no** validaba con la clave de ejemplo y el token fabricado recibía
401. La causa es que la cuenta de Windows de la máquina de pruebas define una
variable de entorno de usuario `SECRET_KEY` (20 caracteres; su valor no se
registra). `load_dotenv()` no sobrescribe variables existentes, por lo que esa
variable tuvo prioridad sobre `backend/.env`.

Esto no anula la debilidad, sino que precisa cuándo aplica:

- La clave efectiva depende del entorno de cada máquina, y nada en el código
  avisa de cuál se usa.
- En cualquier despliegue que siga la documentación del proyecto, la clave es
  la publicada: `README.md:179`, `QUICKSTART.md:20` y `backend/README.md:48`
  indican `cp .env.example .env`.
- Si no hay ni variable ni `.env`, se usa la clave escrita en `config.py:10`,
  que también es pública.

## Control propuesto y prueba de aceptación

Generar una `SECRET_KEY` aleatoria de al menos 32 bytes, quitar el valor por
defecto de `config.py` y abortar el arranque si la clave falta o coincide con
la de `.env.example`.
**Prueba:** con la clave de ejemplo el arranque falla, y este mismo script
obtiene `firma NO válida` y HTTP 401 en el paso 5.
