# Resultados antes y después

Antes: 3 pasan y 4 fallan. Pipeline: FALLA.
Después: 7 pasan y 0 fallan. Pipeline: PASA.

| Prueba | Antes | Después |
|---|---|---|
| test_CP_01_clave_jwt_no_tiene_valor_conocido | FALLA | PASA |
| test_CP_02_imagen_privada_no_se_descarga_sin_permiso | FALLA | PASA |
| test_CP_03_archivo_disfrazado_de_imagen_se_rechaza_y_no_queda_en_disco | FALLA | PASA |
| test_CP_04_endpoint_interno_no_es_publico | FALLA | PASA |
| test_CP_05_usuario_no_ve_ni_edita_album_privado_de_otro | PASA | PASA |
| test_CP_06_usuario_normal_no_accede_a_rutas_de_supervisor_ni_admin | PASA | PASA |
| test_CP_07_subida_y_descarga_legitimas_siguen_funcionando | PASA | PASA |

