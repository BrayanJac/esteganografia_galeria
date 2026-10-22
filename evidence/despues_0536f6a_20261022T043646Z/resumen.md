# Resumen de la corrida: despues_0536f6a_20261022T043646Z

Resultado del pipeline: PASA

Pruebas: 7 pasan, 0 fallan de 7.
Bandit: 2 alertas únicas (0 duplicadas removidas).
pip-audit: 12 vulnerabilidades únicas (8 duplicadas removidas).

## Motivos de falla del gate
- ninguno

## Avisos (no bloquean)
- Bandit MEDIUM/MEDIUM B104 en backend\main.py:96 (candidato a revisión manual)
- Bandit LOW/MEDIUM B105 en backend\services\auth_service.py:92 (candidato a revisión manual)
- anyio 3.7.1: 2 vulnerabilidad(es) con excepción EXC-004
- ecdsa 0.19.2: 1 vulnerabilidad(es) sin versión corregida disponible
- fastapi 0.104.1: 1 vulnerabilidad(es) con excepción EXC-002
- python-jose 3.5.0: 1 vulnerabilidad(es) sin versión corregida disponible
- starlette 0.27.0: 7 vulnerabilidad(es) con excepción EXC-003
