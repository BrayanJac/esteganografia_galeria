"""Validación de archivos subidos y control positivo de subida y descarga."""
from .conftest import archivos_subidos, cabeceras, png_valido, subir

ARCHIVOS_FALSOS = (
    ("foto.png", b"esto no es una imagen", "image/png"),
    ("dibujo.gif", b"<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>", "image/gif"),
)


def test_CP_03_archivo_disfrazado_de_imagen_se_rechaza_y_no_queda_en_disco(client, datos):
    for nombre, contenido, mime in ARCHIVOS_FALSOS:
        antes = archivos_subidos()
        r = subir(client, datos["album_a"], "usuario_a", nombre, contenido, mime)
        assert r.status_code == 400, f"{nombre} se aceptó como imagen"
        assert archivos_subidos() == antes, f"{nombre} quedó guardado en disco"


def test_CP_07_subida_y_descarga_legitimas_siguen_funcionando(client, datos):
    # El dueño sube una imagen válida y puede descargar la de su álbum privado.
    r = subir(client, datos["album_a"], "usuario_a", "ok.png", png_valido())
    assert r.status_code == 200
    r = client.get(f"/api/uploads/{datos['archivo_a']}", headers=cabeceras("usuario_a"))
    assert r.status_code == 200
    # La galería pública sigue sirviendo sus imágenes sin sesión.
    r = subir(client, datos["album_publico_a"], "usuario_a", "publica.png", png_valido())
    assert r.status_code == 200
    r = client.get(f"/api/uploads/{r.json()['filename']}")
    assert r.status_code == 200
