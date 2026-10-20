# Levanta un backend de laboratorio aislado, ejecuta D1, D2 y D3 y guarda cada salida.
# Uso (PowerShell, desde la raíz del repositorio):
#   powershell -ExecutionPolicy Bypass -File docs\p1\evidencias\00_laboratorio\ejecutar_todo.ps1
param(
    [string]$LabDir = "$env:TEMP\galeria-lab-p1",
    [int]$Port = 8001
)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..\..\..").Path
$backend = Join-Path $root "backend"
$ev = Join-Path $root "docs\p1\evidencias"
$py = Join-Path $backend "venv\Scripts\python.exe"

# Base y carpeta de subidas propias: no se tocan backend\test.db ni backend\uploads.
if (Test-Path $LabDir) { Remove-Item -Recurse -Force $LabDir -Confirm:$false }
New-Item -ItemType Directory -Force (Join-Path $LabDir "uploads") | Out-Null
$env:DATABASE_URL = "sqlite:///" + ($LabDir -replace '\\', '/') + "/lab.db"
$env:UPLOAD_DIR = Join-Path $LabDir "uploads"
$env:LAB_BASE_URL = "http://127.0.0.1:$Port"
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONDONTWRITEBYTECODE = "1"
# Una SECRET_KEY en el entorno tiene prioridad sobre backend\.env (python-dotenv no la
# sobrescribe). Se quita solo en este proceso para probar la configuración del proyecto.
Remove-Item Env:SECRET_KEY -ErrorAction SilentlyContinue

Push-Location $backend
$server = Start-Process -FilePath $py -ArgumentList "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", $Port `
    -RedirectStandardOutput (Join-Path $LabDir "uvicorn.out.log") -RedirectStandardError (Join-Path $LabDir "uvicorn.err.log") `
    -PassThru -WindowStyle Hidden
try {
    for ($i = 0; $i -lt 30; $i++) {
        try { $null = Invoke-WebRequest -UseBasicParsing "$env:LAB_BASE_URL/health" -TimeoutSec 2; break } catch { Start-Sleep 1 }
    }
    $steps = @(
        @("00_laboratorio\preparar_lab.py", "00_laboratorio\salida_preparar_lab.txt"),
        @("D1_secreto_por_defecto\verificar_d1.py", "D1_secreto_por_defecto\salida_d1.txt"),
        @("D2_bloqueo_de_cuentas\verificar_d2.py", "D2_bloqueo_de_cuentas\salida_d2.txt"),
        @("D3_uploads_sin_autenticacion\verificar_d3.py", "D3_uploads_sin_autenticacion\salida_d3.txt")
    )
    foreach ($s in $steps) {
        Write-Host "== $($s[0])"
        $ErrorActionPreference = "Continue"
        & $py (Join-Path $ev $s[0]) 2>&1 | ForEach-Object { "$_" } | Out-File -Encoding utf8 (Join-Path $ev $s[1])
        $ErrorActionPreference = "Stop"
        Get-Content -Encoding utf8 (Join-Path $ev $s[1])
    }

    # D3 repetida con curl, sin cabecera Authorization.
    $d3 = Join-Path $ev "D3_uploads_sin_autenticacion"
    $name = Get-Content (Join-Path $d3 "ultimo_filename.txt")
    $tmp = Join-Path $LabDir "descarga.png"
    $out = @("> curl.exe -s -D - -o descarga.png $env:LAB_BASE_URL/api/uploads/$name   (sin cabecera Authorization)")
    $out += (curl.exe -s -D - -o $tmp "$env:LAB_BASE_URL/api/uploads/$name")
    $out += "> (Get-FileHash descarga.png -Algorithm SHA256).Hash"
    $out += (Get-FileHash $tmp -Algorithm SHA256).Hash.ToLower()
    $out += ""
    $out += "> curl.exe -s $env:LAB_BASE_URL/api/images/quarantined   (contraste: listado de cuarentena, sin token)"
    $out += (curl.exe -s -w "`nHTTP %{http_code}" "$env:LAB_BASE_URL/api/images/quarantined")
    $out | Out-File -Encoding utf8 (Join-Path $d3 "salida_curl.txt")
    $out
}
finally {
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
    Pop-Location
}
