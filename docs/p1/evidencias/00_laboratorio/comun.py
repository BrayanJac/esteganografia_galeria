"""Utilidades compartidas por los scripts de evidencia (solo biblioteca estándar)."""
import json
import os
import time
import urllib.error
import urllib.request
import uuid

BASE_URL = os.environ.get("LAB_BASE_URL", "http://127.0.0.1:8001")

# Credenciales sintéticas, solo para el laboratorio local.
ADMIN = {"username": "lab_admin", "email": "lab_admin@example.org", "password": "Lab-Admin-2026!x"}
SUPERVISOR = {"username": "lab_super", "email": "lab_super@example.org", "password": "Lab-Super-2026!x"}


def request(method, path, body=None, token=None, raw=None, content_type=None, retry_429=True):
    """Hace una petición HTTP y devuelve (código, cuerpo_en_bytes)."""
    headers = {}
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    if raw is not None:
        data = raw
        headers["Content-Type"] = content_type
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(BASE_URL + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        if e.code == 429 and retry_429:
            # slowapi limita /login a 10/min y /register a 5/min por IP.
            print("    (429 por límite de peticiones; se espera 61 s y se repite)")
            time.sleep(61)
            return request(method, path, body, token, raw, content_type, retry_429=False)
        return e.code, e.read()


def show(label, status, payload):
    text = payload.decode(errors="replace") if isinstance(payload, bytes) else str(payload)
    print(f"{label} -> HTTP {status} {text[:300]}")


def login(user, password=None):
    return request("POST", "/api/auth/login",
                   {"username": user["username"], "password": password or user["password"]})


def token_of(user):
    status, body = login(user)
    assert status == 200, f"login de {user['username']} falló: {status} {body!r}"
    return json.loads(body)["access_token"]


def register(user):
    return request("POST", "/api/auth/register", user)


def multipart(fields, file_field, filename, file_bytes, mime):
    """Construye un cuerpo multipart/form-data sin dependencias externas."""
    boundary = uuid.uuid4().hex
    parts = []
    for name, value in fields.items():
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
    parts.append(
        f'--{boundary}\r\nContent-Disposition: form-data; name="{file_field}"; filename="{filename}"\r\n'
        f"Content-Type: {mime}\r\n\r\n".encode() + file_bytes + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    return b"".join(parts), f"multipart/form-data; boundary={boundary}"
