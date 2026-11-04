# AI Healthcare Assistant - Launch Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [AI Healthcare Assistant] Launching Backend and Frontend" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# Dynamically resolve current directory so it works on any laptop
$baseDir = $PSScriptRoot
if (-not $baseDir) {
    $baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if (-not $baseDir) {
    $baseDir = (Get-Location).Path
}

# Start Backend Server in a new PowerShell window
Write-Host "`n[1/2] Starting Backend REST API on http://localhost:5000..." -ForegroundColor Yellow
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend'; npm run dev"

Start-Sleep -Seconds 2

# Start Frontend Dev Server in a new PowerShell window
Write-Host "[2/2] Starting Frontend App on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend'; npm run dev"

Write-Host "`nBoth services are now running in separate windows!" -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API:  http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "`nDemo Logins:" -ForegroundColor White
Write-Host "   Patient: patient@healthai.com  |  Patient@123" -ForegroundColor Gray
Write-Host "   Doctor:  doctor@healthai.com   |  Doctor@123" -ForegroundColor Gray
Write-Host "   Admin:   admin@healthai.com    |  Admin@123" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan
