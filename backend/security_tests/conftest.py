"""Configuración común de las pruebas de seguridad de SecureGallery (Actividad 2).

Todo corre contra una base SQLite temporal y una carpeta de subidas temporal,
con datos sintéticos. Nunca se toca la base ni los archivos reales del proyecto.
"""
import io
import os
import sys
import tempfile
from pathlib import Path

import pytest

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

# Claves JWT publicadas en el repositorio (código y .env.example): nunca deben aceptarse.
CLAVES_PUBLICAS = (
    "your-secret-key-change-in-production",
    "your-super-secret-key-change-in-production-min-32-chars",
)

# Variables de entorno ANTES de importar la app (config.py las lee al importarse)
_TMP = Path(tempfile.mkdtemp(prefix="securegallery_test_"))
os.environ["DATABASE_URL"] = f"sqlite:///{_TMP / 'test.db'}"
os.environ["UPLOAD_DIR"] = str(_TMP / "uploads")
os.environ["SECRET_KEY"] = "clave-solo-para-pruebas-0123456789abcdef0123"

from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image as PILImage  # noqa: E402

from database.database import SessionLocal, create_tables  # noqa: E402
from database.models import Album, AlbumStatus, User, UserRole  # noqa: E402
from security.auth import crear_token_acceso, generar_salt, get_password_hash  # noqa: E402

PASSWORD = "ClaveSegura#2026x"


def crear_usuario(username, role=UserRole.USER):
    db = SessionLocal()
    try:
        user = User(
            username=username,
            email=f"{username}@example.test",
            password_hash=get_password_hash(PASSWORD),
            salt=generar_salt(),
            role=role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user.id
    finally:
        db.close()


def crear_album(owner_id, titulo, is_public=False, status=AlbumStatus.APPROVED):
    db = SessionLocal()
    try:
        album = Album(title=titulo, description="álbum sintético", is_public=is_public,
                      owner_id=owner_id, status=status)
        db.add(album)
        db.commit()
        db.refresh(album)
        return album.id
    finally:
        db.close()


def cabeceras(username):
    token = crear_token_acceso({"sub": username})
    return {"Authorization": f"Bearer {token}"}


def png_valido():
    img = PILImage.new("RGB", (64, 64))
    px = img.load()
    for x in range(64):
        for y in range(64):
            px[x, y] = ((x * 4) % 256, (y * 4) % 256, 128)
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()


def archivos_subidos():
    carpeta = Path(os.environ["UPLOAD_DIR"])
    return set(p.name for p in carpeta.iterdir()) if carpeta.exists() else set()


def subir(client, album_id, username, nombre, contenido, mime="image/png"):
    return client.post(
        "/api/images/upload",
        data={"album_id": album_id},
        files={"file": (nombre, contenido, mime)},
        headers=cabeceras(username),
    )


@pytest.fixture(scope="session")
def client():
    from main import app
    create_tables()
    with TestClient(app, base_url="http://localhost") as c:
        yield c


@pytest.fixture(autouse=True)
def reiniciar_limites():
    """Los límites de tasa (5/min registro, 10/min login) no deben contaminar otras pruebas."""
    try:
        from routers.auth_router import limiter
        limiter.reset()
    except Exception:
        pass
    yield


@pytest.fixture(scope="session")
def datos(client):
    ids = {
        "a": crear_usuario("usuario_a"),
        "b": crear_usuario("usuario_b"),
        "supervisor": crear_usuario("supervisor_1", UserRole.SUPERVISOR),
        "admin": crear_usuario("admin_1", UserRole.ADMIN),
    }
    album_privado = crear_album(ids["a"], "Álbum privado de A", is_public=False)
    album_publico = crear_album(ids["a"], "Álbum público de A", is_public=True)

    resp = subir(client, album_privado, "usuario_a", "foto.png", png_valido())
    assert resp.status_code == 200, f"No se pudo preparar la imagen privada de A: {resp.text}"
    return {
        "ids": ids,
        "album_a": album_privado,
        "album_publico_a": album_publico,
        "imagen_a": resp.json()["id"],
        "archivo_a": resp.json()["filename"],
    }
