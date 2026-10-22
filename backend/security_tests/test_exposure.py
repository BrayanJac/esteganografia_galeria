"""Configuración insegura y exposición de información."""
import os
import subprocess
import sys

from .conftest import BACKEND, CLAVES_PUBLICAS, cabeceras

# Carga la configuración en un proceso aparte e informa, sin imprimir la clave, si es pública.
_REVISAR_CLAVE = """
import sys
try:
    from config.config import SECRET_KEY
except RuntimeError:
    print("NO_ARRANCA")
else:
    print("PUBLICA" if SECRET_KEY in sys.argv[1:] else "PRIVADA")
"""


def _cargar_config(secret_key=None):
    """Importa config.config en un subproceso. Sin secret_key se usa la del backend/.env."""
    entorno = {k: v for k, v in os.environ.items() if k != "SECRET_KEY"}
    if secret_key is not None:
        entorno["SECRET_KEY"] = secret_key
    salida = subprocess.run(
        [sys.executable, "-c", _REVISAR_CLAVE, *CLAVES_PUBLICAS],
        cwd=BACKEND, env=entorno, capture_output=True, text=True, timeout=60)
    return salida.stdout.strip().splitlines()[-1] if salida.stdout.strip() else "ERROR"


def test_CP_01_clave_jwt_no_tiene_valor_conocido():
    # Con una clave vacía o publicada en el repositorio, la app no debe arrancar.
    for valor in ("", *CLAVES_PUBLICAS):
        assert _cargar_config(valor) == "NO_ARRANCA", (
            f"La app arranca con una clave JWT insegura ({len(valor)} caracteres)")
    # La configuración real del proyecto (backend/.env) tampoco puede usar una clave pública.
    assert _cargar_config() != "PUBLICA", "backend/.env usa una clave JWT publicada en el repositorio"


def test_CP_04_endpoint_interno_no_es_publico(client, datos):
    r = client.get("/internal/db_tables")
    assert r.status_code in (401, 403), "Expone nombres de tablas sin autenticación"
    r = client.get("/internal/db_tables", headers=cabeceras("usuario_a"))
    assert r.status_code == 403, "Un usuario normal ve los nombres de las tablas"
