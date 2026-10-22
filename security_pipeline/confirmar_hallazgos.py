#!/usr/bin/env python3
"""Confirmación manual reproducible de los hallazgos candidatos CP-01 a CP-04 (laboratorio, datos sintéticos).

Hace las peticiones "a mano" que un revisor haría y deja la respuesta literal como evidencia.
Uso (desde la raíz del repo):
  backend/venv/Scripts/python.exe security_pipeline/confirmar_hallazgos.py > evidence/<carpeta>/confirmacion_manual.txt
"""
import os
import subprocess
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "backend"))


def confirmar_cp01():
    """Se ejecuta en un proceso aparte: la app carga la SECRET_KEY real de backend/.env."""
    tmp = Path(tempfile.mkdtemp(prefix="securegallery_cp01_"))
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp / 'cp01.db'}"
    os.environ["UPLOAD_DIR"] = str(tmp / "uploads")
    os.environ.pop("SECRET_KEY", None)
    try:
        from main import app
    except RuntimeError as e:
        print(f"  la app no arranca: {e}")
        return
    from fastapi.testclient import TestClient
    from jose import jwt
    from database.database import SessionLocal, create_tables
    from database.models import User, UserRole
    from security.auth import generar_salt, get_password_hash
    from security_tests.conftest import CLAVES_PUBLICAS

    create_tables()
    db = SessionLocal()
    db.add(User(username="admin_real", email="admin_real@example.test", role=UserRole.ADMIN,
                password_hash=get_password_hash("ClaveSegura#2026x"), salt=generar_salt()))
    db.commit()
    db.close()
    with TestClient(app, base_url="http://localhost") as cli:
        for clave in CLAVES_PUBLICAS:
            falso = jwt.encode({"sub": "admin_real", "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
                               clave, algorithm="HS256")
            r = cli.get("/api/auth/me", headers={"Authorization": f"Bearer {falso}"})
            print(f"  token firmado con la clave pública de {len(clave)} caracteres -> "
                  f"estado={r.status_code} cuerpo={r.text[:150]}")


def main():
    print("[CP-01] Token de admin fabricado SIN contraseña, firmado con claves publicadas en el repositorio")
    entorno = {**os.environ, "PYTHONIOENCODING": "utf-8"}
    salida = subprocess.run([sys.executable, __file__, "--cp01"], cwd=RAIZ / "backend", env=entorno,
                            capture_output=True, text=True, encoding="utf-8", timeout=120)
    print(salida.stdout.rstrip() or f"  error: {salida.stderr.strip()[-300:]}")
    print()

    import security_tests.conftest as c  # prepara BD y carpeta temporales
    from fastapi.testclient import TestClient
    from main import app

    c.create_tables()
    with TestClient(app, base_url="http://localhost") as cli:
        dueno = c.crear_usuario("dueno")
        c.crear_usuario("otro_usuario")
        album = c.crear_album(dueno, "album-privado-confirmacion", is_public=False)

        print("[CP-02] Imagen de un álbum PRIVADO descargada sin sesión y con la sesión de otro usuario")
        r = c.subir(cli, album, "dueno", "privada.png", c.png_valido())
        archivo = r.json().get("filename")
        print(f"  subida por el dueño: estado={r.status_code} archivo={archivo}")
        for quien, cab in (("sin sesión", {}), ("otro_usuario", c.cabeceras("otro_usuario"))):
            r = cli.get(f"/api/uploads/{archivo}", headers=cab)
            print(f"  GET /api/uploads/{archivo} ({quien}) -> estado={r.status_code} bytes={len(r.content)}")
        print()

        print("[CP-03] Archivos que no son imágenes subidos con extensión de imagen")
        for nombre, contenido, mime in (("foto.png", b"esto no es una imagen", "image/png"),
                                        ("dibujo.gif", b"<svg><script>alert(1)</script></svg>", "image/gif")):
            antes = c.archivos_subidos()
            r = c.subir(cli, album, "dueno", nombre, contenido, mime)
            print(f"  {nombre}: estado={r.status_code} cuerpo={r.text[:150]}")
            print(f"  archivos nuevos en la carpeta de subidas: {sorted(c.archivos_subidos() - antes)}")
        print()

        print("[CP-04] GET /internal/db_tables sin sesión")
        r = cli.get("/internal/db_tables")
        print(f"  estado={r.status_code} cuerpo={r.text[:200]}")


if __name__ == "__main__":
    if "--cp01" in sys.argv:
        confirmar_cp01()
    else:
        print(f"Confirmación manual · {datetime.now(timezone.utc).isoformat(timespec='seconds')}\n")
        main()
