"""D2 – Bloqueo de cuentas sin desbloqueo automático (E2).

Uso (desde backend/, venv activo, servidor de laboratorio arrancado, mismas variables de entorno):
    python ../docs/p1/evidencias/D2_bloqueo_de_cuentas/verificar_d2.py
"""
import os
import sqlite3
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "00_laboratorio"))
from comun import ADMIN, login, register, request, show, token_of  # noqa: E402

USER = {"username": "lab_d2", "email": "lab_d2@example.org", "password": "Lab-D2-Prueba-2026!"}
DB_PATH = os.environ["DATABASE_URL"].replace("sqlite:///", "")
LIMIT = 5  # LOGIN_ATTEMPTS_LIMIT en backend/.env


def db_state(label):
    con = sqlite3.connect(DB_PATH)
    row = con.execute("SELECT id, username, is_active, failed_login_attempts, last_login_attempt "
                      "FROM users WHERE username = ?", (USER["username"],)).fetchone()
    con.close()
    print(f"[SQLite {os.path.basename(DB_PATH)}] {label}: id={row[0]} username={row[1]} is_active={row[2]} "
          f"failed_login_attempts={row[3]} last_login_attempt={row[4]}")
    return row


print("== Paso 1: crear un usuario desechable y comprobar que entra")
show("POST /api/auth/register", *register(USER))
status, _ = login(USER)
print("login con contraseña correcta -> HTTP", status)
user_id = db_state("estado inicial")[0]

print(f"\n== Paso 2: un anónimo falla el login {LIMIT} veces (solo conoce el nombre de usuario)")
for i in range(1, LIMIT + 1):
    show(f"intento fallido {i}", *login(USER, password="Contraseña-Erronea-1!"))
db_state("tras los intentos fallidos")

print("\n== Paso 3: el dueño legítimo usa su contraseña correcta")
show("login con contraseña correcta", *login(USER))

print("\n== Paso 4: simular que pasó la ventana de 15 min (last_login_attempt = hace 20 min)")
con = sqlite3.connect(DB_PATH)
past = (datetime.now(timezone.utc) - timedelta(minutes=20)).strftime("%Y-%m-%d %H:%M:%S.%f")
con.execute("UPDATE users SET last_login_attempt = ? WHERE username = ?", (past, USER["username"]))
con.commit()
con.close()
db_state("tras retroceder la marca de tiempo")
show("login con contraseña correcta tras la ventana", *login(USER))
db_state("sigue bloqueada")

print("\n== Paso 5: solo un admin puede desbloquear (manual); el atacante vuelve a bloquear")
admin_token = token_of(ADMIN)
show(f"POST /api/admin/users/{user_id}/unlock", *request("POST", f"/api/admin/users/{user_id}/unlock", token=admin_token))
status, _ = login(USER)
print("login con contraseña correcta tras el desbloqueo -> HTTP", status)
for i in range(1, LIMIT + 1):
    status, _ = login(USER, password="Contraseña-Erronea-1!")
    print(f"nuevo intento fallido {i} -> HTTP {status}")
show("login con contraseña correcta", *login(USER))
db_state("bloqueada de nuevo")

print("\n== Paso 6: el mensaje distingue cuenta bloqueada de cuenta inexistente (apoya E3)")
show("login de usuario inexistente", *login({"username": "lab_no_existe"}, password="Cualquiera-123!"))
show("login de cuenta bloqueada", *login(USER, password="Cualquiera-123!"))
