# D2 – Bloqueo de cuentas sin desbloqueo automático (E2) · VERIFICADA

**Commit:** `774d070` · **Activo:** A3 (disponibilidad del login) ·
**Hallazgos SAST:** S2, S10

## Debilidad en el código

`backend/security/auth.py`, función `autenticar_usuario`:

```python
 96    if not user or not user.is_active:        # una cuenta bloqueada sale aquí...
 97        db.add(login_attempt)
 98        db.commit()
 99        return None
...
110        # If more time has passed than the window, reset the counter
111        if time_since_last_attempt > window_duration:
112            user.failed_login_attempts = 0    # ...y nunca llega aquí; además solo toca el contador
...
118        if user.failed_login_attempts >= LOGIN_ATTEMPTS_LIMIT:
119            user.is_active = False
```

- Cualquiera que conozca el nombre de usuario bloquea la cuenta con
  `LOGIN_ATTEMPTS_LIMIT` (5) contraseñas erróneas.
- La ventana de `LOGIN_ATTEMPTS_WINDOW_MINUTES` (15) no desbloquea: solo
  reinicia el contador, y con la cuenta bloqueada nunca se ejecuta, porque la
  línea 96 retorna antes.
- La única vía de desbloqueo es **manual**: `POST /api/admin/users/{id}/unlock`
  (`backend/routers/admin_router.py:54-72`, solo admin).
- `backend/services/auth_service.py:66-71` responde con un mensaje distinto a
  una cuenta bloqueada, lo que confirma al atacante que el bloqueo funcionó (E3).

## Pasos para reproducirlo

Ejecutar `verificar_d2.py` desde `backend/`, con las mismas `DATABASE_URL` y
`UPLOAD_DIR` del servidor (o usar `ejecutar_todo.ps1`):

1. Registrar a `lab_d2` y comprobar que inicia sesión (HTTP 200).
2. Enviar 5 logins con una contraseña errónea, sin token ni conocimiento previo.
3. Intentar entrar con la contraseña **correcta**.
4. Simular que pasó la ventana: poner `last_login_attempt` 20 minutos en el
   pasado directamente en `lab.db` y repetir el paso 3. Así se evita esperar
   15 minutos y no se cambia ninguna configuración.
5. Desbloquear como admin, comprobar el acceso y volver a bloquear con otros
   5 intentos.
6. Comparar la respuesta para un usuario inexistente y para la cuenta bloqueada.

El estado de la cuenta se lee de la tabla `users` de la base de laboratorio en
cada paso.

## Resultado obtenido ([salida_d2.txt](salida_d2.txt))

```
login con contraseña correcta -> HTTP 200
[SQLite lab.db] estado inicial: ... is_active=1 failed_login_attempts=0
intento fallido 1..4 -> HTTP 401 {"detail":"Credenciales inválidas"}
intento fallido 5 -> HTTP 401 {"detail":"Usuario bloqueado por demasiados intentos fallidos. Contacte al administrador."}
[SQLite lab.db] tras los intentos fallidos: ... is_active=0 failed_login_attempts=5
login con contraseña correcta -> HTTP 401 {"detail":"Usuario bloqueado ..."}
[SQLite lab.db] tras retroceder la marca de tiempo: ... is_active=0 ... last_login_attempt=2026-10-20 05:06:00
login con contraseña correcta tras la ventana -> HTTP 401 {"detail":"Usuario bloqueado ..."}
POST /api/admin/users/4/unlock -> HTTP 200 {"mensaje":"Usuario desbloqueado exitosamente", ...}
login con contraseña correcta tras el desbloqueo -> HTTP 200
nuevo intento fallido 1..5 -> HTTP 401
login con contraseña correcta -> HTTP 401 {"detail":"Usuario bloqueado ..."}
login de usuario inexistente -> HTTP 401 {"detail":"Credenciales inválidas"}
login de cuenta bloqueada  -> HTTP 401 {"detail":"Usuario bloqueado por demasiados intentos fallidos. Contacte al administrador."}
```

**Conclusión:** un anónimo deja a un usuario legítimo sin acceso con
5 peticiones. El bloqueo sobrevive al paso de la ventana. Solo un admin puede
revertirlo, a mano, y el atacante vuelve a bloquear la cuenta en segundos, así
que la denegación de servicio se mantiene mientras el atacante quiera. El
límite de slowapi (10/min por IP) no lo impide, porque bastan 5 peticiones.

## Control propuesto y prueba de aceptación

Desbloqueo automático al pasar la ventana (o retraso progresivo en lugar de
`is_active = False`), mensaje genérico idéntico para todos los fallos, y
registro del bloqueo en `security_logs`.
**Prueba:** en el paso 4 de este script, el login con la contraseña correcta
devuelve 200, y en el paso 6 ambas respuestas son idénticas.
