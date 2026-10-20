# D3 – Archivos servidos sin control de acceso (E4) · VERIFICADA

**Commit:** `774d070` · **Activo:** A4 (imágenes privadas y en cuarentena) ·
**Hallazgo SAST:** S3

## Debilidad en el código

`backend/routers/gallery_router.py:21-23` no declara ninguna dependencia de
autenticación:

```python
@router.get("/uploads/{filename}")
async def get_image_endpoint(filename: str):
    return serve_image(filename)
```

`backend/services/gallery_service.py:87-103` (`serve_image`) entrega el
archivo si existe en disco, sin consultar en la base ni el álbum, ni su
privacidad, ni el estado de la imagen. Las imágenes en cuarentena se guardan en
la misma carpeta `UPLOAD_DIR` que las aprobadas (`image_service.py:149-150`);
la cuarentena es solo un valor de `status` en la base (`image_service.py:50-52`).

Contraste con el resto de la app: `/api/gallery/{id}` filtra por
`APPROVED` + `is_public` (`gallery_service.py:45-61`), y
`/api/images/quarantined` exige supervisor o admin.

## Pasos para reproducirlo

Ejecutar `verificar_d3.py` desde `backend/` (o usar `ejecutar_todo.ps1`):

1. `lab_d3` crea un álbum **privado** (`is_public=false`) y `lab_super` lo
   aprueba. La subida exige un álbum aprobado.
2. Se sube una imagen sintética: un degradado PNG de 128×128 con 203 bytes
   añadidos después del marcador `IEND`. El análisis EOF la marca y queda
   `quarantined`.
3. Contraste sin token: `GET /api/gallery/{id}` y `GET /api/images/quarantined`.
4. Se descarga `GET /api/uploads/<filename>` **sin token** y se compara el
   SHA-256 con el original.
5. Se repite la descarga con `curl.exe`, sin cabecera `Authorization`
   ([salida_curl.txt](salida_curl.txt)).

## Resultado obtenido ([salida_d3.txt](salida_d3.txt), [salida_curl.txt](salida_curl.txt))

```
POST /api/albums/ (is_public=false) -> HTTP 200 {"id":1,...,"status":"pending",...}
POST /api/albums/1/approve -> HTTP 200
imagen local: 501 bytes, sha256=22c39f53b818bff162110b0c3ba921864407fd99e9499ba42980be60b7574342
POST /api/images/upload -> HTTP 200 {"id":1,"filename":"22c39f53b818bff1_1792492087.816967.png","status":"quarantined",...}

GET /api/gallery/1 sin token (álbum privado) -> HTTP 404 {"detail":"Álbum no encontrado"}
GET /api/images/quarantined sin token        -> HTTP 403 {"detail":"Not authenticated"}

GET /api/uploads/22c39f53b818bff1_1792492087.816967.png sin token -> HTTP 200, 501 bytes, sha256=22c39f53…7574342
¿es idéntico al archivo subido?: True
¿contiene los datos ocultos?: True

> curl.exe -s -D - -o descarga.png http://127.0.0.1:8001/api/uploads/22c39f53b818bff1_1792492087.816967.png
HTTP/1.1 200 OK
cache-control: public, max-age=31536000
content-type: image/jpeg
content-length: 501
```

**Conclusión:** una imagen en cuarentena, de un álbum privado, se descarga
completa (con los datos ocultos incluidos) sin autenticación. La app oculta la
imagen en los listados, pero no protege el archivo.

Observaciones adicionales:
- La respuesta lleva `Cache-Control: public, max-age=31536000`: cualquier
  proxy o caché intermedia puede guardar la imagen privada durante un año.
- El nombre de archivo son los 16 primeros caracteres hexadecimales del
  SHA-256 del contenido más una marca de tiempo (`image_service.py:149`). No es
  trivial de adivinar a ciegas, pero no es un secreto: se expone en las
  respuestas de la API a quien ve el álbum, y cualquiera que lo obtenga (enlace
  compartido, historial, caché) descarga el archivo.
- Se sirve un PNG con `content-type: image/jpeg` (valor fijo en
  `gallery_service.py:98`).

## Control propuesto y prueba de aceptación

Exigir token en `/api/uploads/{filename}` y servir el archivo solo si la imagen
es `CLEAN`/`APPROVED` en un álbum aprobado y público, o si quien la pide es el
dueño o un supervisor. Nunca servir imágenes en cuarentena a usuarios comunes,
y usar `Cache-Control: private`.
**Prueba:** el paso 4 de este script devuelve 401 sin token y 403 con el token
de otro usuario; el dueño sí obtiene su imagen.
