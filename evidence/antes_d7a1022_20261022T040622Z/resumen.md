# Resumen de la corrida: antes_d7a1022_20261022T040622Z

Resultado del pipeline: FALLA

Pruebas: 3 pasan, 4 fallan de 7.
Bandit: 2 alertas únicas (0 duplicadas removidas).
pip-audit: 50 vulnerabilidades únicas (23 duplicadas removidas).

## Motivos de falla del gate
- G1 prueba fallida: test_CP_02_imagen_privada_no_se_descarga_sin_permiso
- G1 prueba fallida: test_CP_01_clave_jwt_no_tiene_valor_conocido
- G1 prueba fallida: test_CP_04_endpoint_interno_no_es_publico
- G1 prueba fallida: test_CP_03_archivo_disfrazado_de_imagen_se_rechaza_y_no_queda_en_disco
- G3 anyio 3.7.1: 2 vulnerabilidad(es) con corrección disponible (p. ej. CVE-2026-63374)
- G3 fastapi 0.104.1: 1 vulnerabilidad(es) con corrección disponible (p. ej. CVE-2024-24762)
- G3 pillow 10.1.0: 38 vulnerabilidad(es) con corrección disponible (p. ej. CVE-2023-50447)
- G3 starlette 0.27.0: 7 vulnerabilidad(es) con corrección disponible (p. ej. CVE-2024-47874)

## Avisos (no bloquean)
- Bandit MEDIUM/MEDIUM B104 en backend\main.py:92 (candidato a revisión manual)
- Bandit LOW/MEDIUM B105 en backend\services\auth_service.py:92 (candidato a revisión manual)
- ecdsa 0.19.2: 1 vulnerabilidad(es) sin versión corregida disponible
- python-jose 3.5.0: 1 vulnerabilidad(es) sin versión corregida disponible
