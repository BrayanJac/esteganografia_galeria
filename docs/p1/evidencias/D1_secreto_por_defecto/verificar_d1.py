"""D1 – Secreto de firma por defecto (E1).

Demuestra que los JWT del servidor se firman con la clave publicada en backend/.env.example.
No imprime la SECRET_KEY real: solo compara valores y usa la clave que ya es pública en el repositorio.

Uso (desde backend/, venv activo, servidor de laboratorio arrancado):
    python ../docs/p1/evidencias/D1_secreto_por_defecto/verificar_d1.py
"""
import base64
import json
import os
import re
import secrets
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "00_laboratorio"))
from jose import JWTError, jwt  # noqa: E402
from comun import register, request, show, token_of  # noqa: E402

USER = {"username": "lab_d1", "email": "lab_d1@example.org", "password": "Lab-D1-Prueba-2026!"}


def env_value(path, key):
    for line in open(path, encoding="utf-8"):
        m = re.match(rf"\s*{key}\s*=\s*(.*)", line)
        if m:
            return m.group(1).strip().strip("\"'")
    return None


def b64json(part):
    return json.loads(base64.urlsafe_b64decode(part + "=" * (-len(part) % 4)))


print("== Paso 0: ¿hay una variable de entorno SECRET_KEY que tenga prioridad sobre el .env?")
print("SECRET_KEY presente en el entorno de esta consola:", "SECRET_KEY" in os.environ)
print("(python-dotenv no sobrescribe variables existentes; el servidor debe arrancarse en una consola igual)\n")

print("== Paso 1: la clave por defecto está en el código y en el ejemplo publicado")
for path in ("config/config.py", ".env.example"):
    for n, line in enumerate(open(path, encoding="utf-8"), 1):
        if "SECRET_KEY" in line:
            print(f"{path}:{n}: {line.rstrip()}")

example_key = env_value(".env.example", "SECRET_KEY")
real_key = env_value(".env", "SECRET_KEY")
print("\n== Paso 2: ¿el .env del laboratorio usa la clave publicada? (sin imprimir el valor)")
print("SECRET_KEY definida en backend/.env:", real_key is not None)
print("backend/.env == backend/.env.example:", real_key == example_key)

print("\n== Paso 3: iniciar sesión con un usuario sintético y obtener su token")
show("POST /api/auth/register", *register(USER))
token = token_of(USER)
header, payload, _ = token.split(".")
print("cabecera:", b64json(header))
print("payload :", b64json(payload))

print("\n== Paso 4: validar la firma del token emitido con la clave publicada")
try:
    claims = jwt.decode(token, example_key, algorithms=["HS256"])
    print("firma VÁLIDA con la clave de .env.example ->", claims)
except JWTError as e:
    print("firma NO válida con la clave de .env.example:", e)
try:
    jwt.decode(token, secrets.token_urlsafe(48), algorithms=["HS256"])
    print("control: la firma validó con una clave aleatoria (no debería)")
except JWTError as e:
    print("control: con una clave aleatoria la firma falla ->", e)

print("\n== Paso 5: un token fabricado fuera del servidor con la clave publicada es aceptado")
exp = datetime.now(timezone.utc) + timedelta(minutes=5)
forged = jwt.encode({"sub": USER["username"], "exp": exp}, example_key, algorithm="HS256")
show("GET /api/auth/me (token fabricado con la clave de .env.example)", *request("GET", "/api/auth/me", token=forged))
control = jwt.encode({"sub": USER["username"], "exp": exp}, secrets.token_urlsafe(48), algorithm="HS256")
show("GET /api/auth/me (control: token firmado con clave aleatoria)", *request("GET", "/api/auth/me", token=control))
