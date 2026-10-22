# Pipeline de seguridad – Actividad 2 (Parcial 1)

Procedimiento repetible para detectar fallas de seguridad en SecureGallery y comprobar su corrección.
Todo corre en local, con una base SQLite y una carpeta de subidas temporales y datos sintéticos.

## Contenido

| Ruta | Función |
| --- | --- |
| `run_security_checks.sh` | Script único: registra el entorno, ejecuta Bandit (SAST), pip-audit (SCA), pytest y el gate |
| `security_gate.py` | Junta los resultados, quita duplicados y decide si el pipeline pasa (`evaluar`); compara dos corridas (`comparar`) |
| `exceptions.json` | Excepciones justificadas (EXC-002 a EXC-004) |
| `confirmar_hallazgos.py` | Confirmación manual reproducible de CP-01 a CP-04 |
| `congelar_dependencias.py` | Lista exacta de dependencias de ejecución para el SCA |
| `requirements-security.txt` | Versiones fijas de las herramientas |
| `../backend/security_tests/` | Los 7 casos de prueba (CP-01 a CP-07) |
| `../evidence/` | Evidencia de cada corrida (`<etiqueta>_<commit>_<fecha>/`) |

## Requisitos

- Python 3.11 con el entorno virtual del backend en `backend/venv`
- Git Bash o WSL (el script es de bash)
- `backend/.env` con una `SECRET_KEY` aleatoria de 32 caracteres o más (ver `backend/.env.example`)

## Cómo repetirlo

Desde la raíz del repositorio, en Git Bash:

```bash
backend/venv/Scripts/python.exe -m pip install -r backend/requirements.txt -r security_pipeline/requirements-security.txt

# Corrida inicial (sobre el código sin corregir, commit d7a1022), sin excepciones
./security_pipeline/run_security_checks.sh antes --sin-excepciones
backend/venv/Scripts/python.exe security_pipeline/confirmar_hallazgos.py > evidence/<carpeta_antes>/confirmacion_manual.txt

# Repetición exacta sobre el código corregido
./security_pipeline/run_security_checks.sh despues
backend/venv/Scripts/python.exe security_pipeline/security_gate.py comparar evidence/<carpeta_antes> evidence/<carpeta_despues>
```

Solo las pruebas: `cd backend && venv/Scripts/python.exe -m pytest`.

## Cuándo falla el pipeline

- **G1:** una prueba falla sin excepción vigente.
- **G2:** Bandit reporta severidad alta, o media con confianza alta.
- **G3:** una dependencia tiene una vulnerabilidad con versión corregida (se cuenta una vez por paquete).
- **G4:** hay una excepción obsoleta (su caso ya pasa).

Una excepción solo vale si tiene `id`, `caso`, `motivo`, `mitigacion`, `aprobado_por` y una fecha `vence` futura.

## Resultados

| Corrida | Commit | Pruebas | Vulnerabilidades únicas | Pipeline |
| --- | --- | --- | --- | --- |
| [antes](../evidence/antes_d7a1022_20261022T040622Z/resumen.md) | `d7a1022` | 3 de 7 | 50 | FALLA |
| [después](../evidence/despues_0536f6a_20261022T043646Z/resumen.md) | `0536f6a` | 7 de 7 | 12 | PASA |
