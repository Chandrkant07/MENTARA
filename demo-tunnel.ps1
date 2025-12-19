param(
  [string]$Workspace = "C:\Users\dhiba\OneDrive\ALLDOCS\fr\fr\IB_Django\IB_Django"
)

Write-Host "Demo tunnel helper (localtunnel via npx)" -ForegroundColor Cyan
Write-Host "Workspace: $Workspace"
Write-Host ""

if (-not (Test-Path $Workspace)) {
  Write-Host "ERROR: Workspace path not found: $Workspace" -ForegroundColor Red
  exit 1
}

$frontendPath = Join-Path $Workspace "frontend"
$venvActivate = Join-Path $Workspace "IBenv\Scripts\Activate.ps1"

if (-not (Test-Path $frontendPath)) {
  Write-Host "ERROR: frontend folder not found: $frontendPath" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path $venvActivate)) {
  Write-Host "ERROR: venv activate script not found: $venvActivate" -ForegroundColor Red
  Write-Host "Tip: ensure your venv exists at IBenv/." -ForegroundColor Yellow
  exit 1
}

$node = Get-Command node -ErrorAction SilentlyContinue
$npm  = Get-Command npm  -ErrorAction SilentlyContinue
if (-not $node -or -not $npm) {
  Write-Host "ERROR: node/npm not found in PATH." -ForegroundColor Red
  Write-Host "Install Node.js LTS, then re-run this script." -ForegroundColor Yellow
  exit 1
}

Write-Host "Next steps (run in 4 terminals):" -ForegroundColor Green
Write-Host "1) Backend server:" -ForegroundColor Green
Write-Host "   Set-Location \"$Workspace\"; .\IBenv\Scripts\Activate.ps1; \$env:DEBUG='True'; \$env:ALLOWED_HOSTS='*'; python manage.py migrate; python manage.py runserver 127.0.0.1:8000"
Write-Host "2) Backend tunnel (copy URL):" -ForegroundColor Green
Write-Host "   Set-Location \"$Workspace\"; npx localtunnel --port 8000"
Write-Host "3) Frontend dev (set VITE_BASE_API to backendUrl + /api):" -ForegroundColor Green
Write-Host "   Set-Location \"$frontendPath\"; \$env:VITE_BASE_API='https://<backend>.loca.lt/api'; npm install; npm run dev -- --host 127.0.0.1 --port 3000"
Write-Host "4) Frontend tunnel (send this URL to client):" -ForegroundColor Green
Write-Host "   Set-Location \"$frontendPath\"; npx localtunnel --port 3000"
Write-Host ""
Write-Host "Full guide: DEMO_TUNNEL.md" -ForegroundColor Cyan
