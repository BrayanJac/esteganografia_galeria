"""Crea el admin del laboratorio directamente en la base (es la única vía que admite la app)
y, a través de la API, el supervisor.

Uso (desde backend/, con el venv activo y el servidor de laboratorio arrancado):
    python ../docs/p1/evidencias/00_laboratorio/preparar_lab.py
Requiere las mismas variables DATABASE_URL y UPLOAD_DIR con las que se arrancó el servidor.
"""
import os
import sys

sys.path.insert(0, os.getcwd())                      # backend/
sys.path.insert(0, os.path.dirname(__file__))        # comun.py

from database.database import SessionLocal, create_tables  # noqa: E402
from database.models import User, UserRole  # noqa: E402
from security.auth import generar_salt, get_password_hash  # noqa: E402
from comun import ADMIN, SUPERVISOR, request, show, token_of  # noqa: E402

assert "lab" in os.environ.get("DATABASE_URL", ""), "DATABASE_URL debe apuntar a la base de laboratorio"

create_tables()
db = SessionLocal()
if not db.query(User).filter(User.username == ADMIN["username"]).first():
    db.add(User(username=ADMIN["username"], email=ADMIN["email"],
                password_hash=get_password_hash(ADMIN["password"]),
                salt=generar_salt(), role=UserRole.ADMIN))
    db.commit()
    print(f"admin '{ADMIN['username']}' creado en la base de laboratorio")
db.close()

admin_token = token_of(ADMIN)
show("POST /api/auth/supervisors", *request("POST", "/api/auth/supervisors", SUPERVISOR, token=admin_token))
