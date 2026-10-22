#!/usr/bin/env bash
# Pipeline único de seguridad: SAST (Bandit) + SCA (pip-audit) + pruebas automatizadas (pytest) + gate.
# Uso (Git Bash o WSL, desde cualquier carpeta):
#   ./security_pipeline/run_security_checks.sh antes --sin-excepciones
#   ./security_pipeline/run_security_checks.sh despues
# Usa el Python del entorno virtual activo o, si no hay ninguno, backend/venv.
set -uo pipefail

ETIQUETA="${1:-corrida}"
EXTRA="${2:-}"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMMIT="$(git -C "$RAIZ" rev-parse --short HEAD 2>/dev/null || echo sin-git)"
SALIDA="$RAIZ/evidence/${ETIQUETA}_${COMMIT}_$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$SALIDA"
export PYTHONIOENCODING=utf-8 PYTHONDONTWRITEBYTECODE=1

if [ -n "${VIRTUAL_ENV:-}" ]; then
  PY="python"
elif [ -x "$RAIZ/backend/venv/Scripts/python.exe" ]; then
  PY="$RAIZ/backend/venv/Scripts/python.exe"
else
  PY="$RAIZ/backend/venv/bin/python"
fi

echo "== Registro del entorno =="
{
  echo "fecha_utc: $(date -u +%FT%TZ)"
  echo "commit: $COMMIT ($(git -C "$RAIZ" rev-parse --abbrev-ref HEAD 2>/dev/null))"
  echo "cambios_sin_commit:"; git -C "$RAIZ" status --short
  echo "sistema: $(uname -srm)"
  echo "python: $("$PY" --version 2>&1)"
  echo "herramientas:"; "$PY" -m pip list 2>/dev/null | grep -iE "^(bandit|pip.audit|pytest|httpx|fastapi|starlette|pillow|python-jose|python-multipart) "
  echo "comando: $0 $*"
} > "$SALIDA/entorno.txt"

# En Git Bash, Python de Windows necesita rutas C:\...; en WSL/Linux se dejan igual.
ruta() { cygpath -w "$1" 2>/dev/null || echo "$1"; }

echo "== 1/3 SAST: Bandit =="
"$PY" -m bandit -r "$(ruta "$RAIZ/backend")" -x "$(ruta "$RAIZ/backend/venv"),$(ruta "$RAIZ/backend/security_tests")" \
  -f json -o "$SALIDA/bandit.json" -q || true

echo "== 2/3 SCA: pip-audit sobre las dependencias exactas del proyecto =="
"$PY" "$RAIZ/security_pipeline/congelar_dependencias.py" "$RAIZ/backend/requirements.txt" \
  > "$SALIDA/dependencias_exactas.txt" 2> "$SALIDA/congelar.log"
"$PY" -m pip_audit -r "$SALIDA/dependencias_exactas.txt" --no-deps --disable-pip \
  -f json -o "$SALIDA/pip_audit.json" > "$SALIDA/pip_audit.log" 2>&1 || true

echo "== 3/3 Pruebas automatizadas: pytest =="
( cd "$RAIZ/backend" && "$PY" -m pytest --junitxml="$SALIDA/pytest_junit.xml" -q ) > "$SALIDA/pytest.log" 2>&1 || true
grep -E "^(FAILED|ERROR)|passed|failed" "$SALIDA/pytest.log"

echo "== Gate =="
"$PY" "$RAIZ/security_pipeline/security_gate.py" evaluar "$SALIDA" $EXTRA
CODIGO=$?
echo "Evidencia guardada en: $SALIDA"
exit $CODIGO
