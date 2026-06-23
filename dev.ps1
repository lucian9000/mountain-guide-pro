# dev.ps1 — runs the Vite dev server and tees all output to dev.log
# Usage: .\dev.ps1

$logFile = Join-Path $PSScriptRoot "dev.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"" | Out-File $logFile -Encoding utf8
"=== SummitFit Dev Server — started $timestamp ===" | Out-File $logFile -Append -Encoding utf8
"" | Out-File $logFile -Append -Encoding utf8

Write-Host "Logging to: $logFile" -ForegroundColor Cyan
Write-Host "Open http://localhost:8080 once the server is ready." -ForegroundColor Green
Write-Host ""

# Delete stale Vite cache so deps are rebuilt clean
$viteCache = Join-Path $PSScriptRoot "node_modules\.vite"
if (Test-Path $viteCache) {
    Remove-Item -Recurse -Force $viteCache
    Write-Host "Cleared stale Vite cache." -ForegroundColor Yellow
    "  [setup] Cleared stale Vite cache." | Out-File $logFile -Append -Encoding utf8
}

# Run dev server, tee output to log file
npm run dev 2>&1 | Tee-Object -FilePath $logFile -Append
