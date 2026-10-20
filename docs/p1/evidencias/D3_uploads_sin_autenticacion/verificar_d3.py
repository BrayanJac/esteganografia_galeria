"""D3 – Archivos servidos sin control de acceso (E4).

Sube a un álbum PRIVADO una imagen sintética que el sistema pone en cuarentena y
la descarga después sin ningún token.

Uso (desde backend/, venv activo, servidor de laboratorio arrancado):
    python ../docs/p1/evidencias/D3_uploads_sin_autenticacion/verificar_d3.py
"""
import hashlib
import io
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "00_laboratorio"))
from PIL import Image  # noqa: E402
from comun import SUPERVISOR, multipart, register, request, show, token_of  # noqa: E402

USER = {"username": "lab_d3", "email": "lab_d3@example.org", "password": "Lab-D3-Prueba-2026!"}


def synthetic_png_with_trailer():
    """Degradado de 128x128 + 203 bytes después del marcador IEND (dispara el análisis EOF)."""
    img = Image.new("RGB", (128, 128))
    img.putdata([(x * 2, y * 2, (x + y) % 256) for y in range(128) for x in range(128)])
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue() + b"LAB-P1-DATO-OCULTO-SINTETICO;" * 7


print("== Paso 1: usuario sintético crea un álbum PRIVADO y un supervisor lo aprueba")
show("POST /api/auth/register", *register(USER))
user_token = token_of(USER)
status, body = request("POST", "/api/albums/", {"title": "Álbum privado D3", "description": "Prueba P1",
                                                "is_public": False}, token=user_token)
show("POST /api/albums/ (is_public=false)", status, body)
album_id = json.loads(body)["id"]
show(f"POST /api/albums/{album_id}/approve", *request("POST", f"/api/albums/{album_id}/approve",
                                                      {"approved": True, "comment": "Aprobado para la prueba D3"},
                                                      token=token_of(SUPERVISOR)))

print("\n== Paso 2: subir una imagen sintética con datos tras el fin de archivo")
png = synthetic_png_with_trailer()
print(f"imagen local: {len(png)} bytes, sha256={hashlib.sha256(png).hexdigest()}")
data, ctype = multipart({"album_id": album_id}, "file", "d3_sintetica.png", png, "image/png")
status, body = request("POST", "/api/images/upload", raw=data, content_type=ctype, token=user_token)
show("POST /api/images/upload", status, body)
filename = json.loads(body)["filename"]

print("\n== Paso 3: controles que SÍ protegen (contraste)")
show(f"GET /api/gallery/{album_id} sin token (álbum privado)", *request("GET", f"/api/gallery/{album_id}"))
show("GET /api/images/quarantined sin token", *request("GET", "/api/images/quarantined"))

print("\n== Paso 4: descargar el archivo en cuarentena SIN token")
status, content = request("GET", f"/api/uploads/{filename}")
print(f"GET /api/uploads/{filename} sin token -> HTTP {status}, {len(content)} bytes, "
      f"sha256={hashlib.sha256(content).hexdigest()}")
print("¿es idéntico al archivo subido?:", content == png)
print("¿contiene los datos ocultos?:", b"LAB-P1-DATO-OCULTO-SINTETICO" in content)

with open(os.path.join(os.path.dirname(__file__), "ultimo_filename.txt"), "w") as f:
    f.write(filename)
print(f"\nNombre guardado en ultimo_filename.txt para repetir con curl:\n"
      f"  curl.exe -s -o NUL -w \"HTTP %{{http_code}} %{{size_download}} bytes\\n\" "
      f"http://127.0.0.1:8001/api/uploads/{filename}")
