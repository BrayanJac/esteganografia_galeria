# Evidencias P1 – Galería Segura · commit `774d070`

| Carpeta | Contenido | Estado |
| --- | --- | --- |
| [sast/](sast/README.md) | Revisión de código estático con Semgrep: método, reglas propias y triaje de 20 hallazgos | Completa |
| [00_laboratorio/](00_laboratorio/README.md) | Entorno, versiones y script que repite todas las pruebas de ejecución | Completa |
| [D1_secreto_por_defecto/](D1_secreto_por_defecto/README.md) | E1 – los JWT se firman con la clave publicada en `.env.example` | **Verificada** |
| [D2_bloqueo_de_cuentas/](D2_bloqueo_de_cuentas/README.md) | E2 – 5 intentos fallidos bloquean la cuenta sin desbloqueo automático | **Verificada** |
| [D3_uploads_sin_autenticacion/](D3_uploads_sin_autenticacion/README.md) | E4 – imágenes privadas o en cuarentena descargables sin token | **Verificada** |

Hipótesis sin verificar en ejecución: E5 (ruta sin normalizar), E6 (JWT en
`localStorage` y CSP permisiva). E3 (enumeración) y E7 (`/internal/db_tables`
público) están confirmadas en el código; E3 también aparece en la salida de D2.

Para repetir todo, desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File docs\p1\evidencias\00_laboratorio\ejecutar_todo.ps1
```

Todas las pruebas se hicieron en `127.0.0.1`, con datos sintéticos y una base
de laboratorio separada de `backend/test.db`.
