"""Autorización: acceso entre usuarios (IDOR) y escalada de rol."""
from .conftest import cabeceras


def test_CP_02_imagen_privada_no_se_descarga_sin_permiso(client, datos):
    ruta = f"/api/uploads/{datos['archivo_a']}"
    r = client.get(ruta)
    assert r.status_code == 404, "La imagen del álbum privado de A se descarga sin sesión"
    r = client.get(ruta, headers=cabeceras("usuario_b"))
    assert r.status_code == 404, "El usuario B descarga la imagen del álbum privado de A"


def test_CP_05_usuario_no_ve_ni_edita_album_privado_de_otro(client, datos):
    r = client.get(f"/api/albums/{datos['album_a']}", headers=cabeceras("usuario_b"))
    assert r.status_code == 403
    r = client.put(f"/api/albums/{datos['album_a']}", json={"title": "secuestrado"},
                   headers=cabeceras("usuario_b"))
    assert r.status_code == 403


def test_CP_06_usuario_normal_no_accede_a_rutas_de_supervisor_ni_admin(client, datos):
    r = client.get("/api/images/quarantined", headers=cabeceras("usuario_a"))
    assert r.status_code == 403
    r = client.get("/api/admin/users", headers=cabeceras("usuario_a"))
    assert r.status_code == 403
