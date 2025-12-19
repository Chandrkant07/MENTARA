# Runs Mentara locally (Windows) and optionally executes the Playwright admin smoke test.
# Usage:
#   .\run-demo-and-smoke.ps1
#   .\run-demo-and-smoke.ps1 -Smoke

param(
  [switch]$Smoke
)

$ErrorActionPreference = 'Stop'

function Wait-Http200 {
  param(
    [Parameter(Mandatory=$true)][string]$Url,
    [int]$TimeoutSeconds = 60
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      if ($resp.StatusCode -eq 200) { return }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }

  throw "Timed out waiting for HTTP 200 from $Url"
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Starting backend (Django) on 127.0.0.1:8000..." -ForegroundColor Cyan

$venvPython = Join-Path $root '.venv\Scripts\python.exe'
if (-not (Test-Path $venvPython)) {
  throw "Missing .venv. Create it first and install requirements: python -m venv .venv; .\\.venv\\Scripts\\python.exe -m pip install -r requirements.txt"
}

# Backend in separate window (do NOT rely on Activate.ps1)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; & '$venvPython' manage.py runserver 127.0.0.1:8000" | Out-Null

Write-Host "Starting frontend (Vite) on 127.0.0.1:3000..." -ForegroundColor Cyan

$frontendDir = Join-Path $root 'frontend'
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev" | Out-Null

Write-Host "Waiting for backend and frontend to be ready..." -ForegroundColor Yellow
Wait-Http200 -Url 'http://127.0.0.1:8000/api/health/' -TimeoutSeconds 90
Wait-Http200 -Url 'http://127.0.0.1:3000/' -TimeoutSeconds 90

Write-Host "OK: Backend and frontend are up." -ForegroundColor Green
Write-Host "Frontend: http://127.0.0.1:3000" -ForegroundColor White
Write-Host "Backend:  http://127.0.0.1:8000" -ForegroundColor White

if ($Smoke) {
  Write-Host "Running Playwright admin smoke..." -ForegroundColor Cyan
  Set-Location $frontendDir
  $env:PW_BASE_URL = 'http://127.0.0.1:3000'
  npx playwright test admin-smoke --project=chromium --timeout=60000
}
