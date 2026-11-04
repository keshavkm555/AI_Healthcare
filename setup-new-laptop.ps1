# AI Healthcare Assistant - Automated Setup for New Laptop
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🏥 AI Healthcare Assistant — Automated Setup Script" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$baseDir = $PSScriptRoot
if (-not $baseDir) {
    $baseDir = (Get-Location).Path
}

# 1. Verify Node.js is installed
Write-Host "`n[1/4] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVer = node -v
    Write-Host "✅ Found Node.js: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not found in PATH." -ForegroundColor Red
    Write-Host "Please download and install Node.js (v18+) from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# 2. Setup Backend
Write-Host "`n[2/4] Setting up Backend..." -ForegroundColor Yellow
$backendEnv = Join-Path $baseDir "backend\.env"
$backendEnvExample = Join-Path $baseDir "backend\.env.example"
if (-not (Test-Path $backendEnv)) {
    if (Test-Path $backendEnvExample) {
        Copy-Item $backendEnvExample $backendEnv
        Write-Host "Created backend\.env from template." -ForegroundColor Cyan
    }
}

Push-Location (Join-Path $baseDir "backend")
Write-Host "Installing backend packages (express, mysql2, bcryptjs, jsonwebtoken, etc.)..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ npm install encountered warnings or errors." -ForegroundColor Yellow
} else {
    Write-Host "✅ Backend packages installed successfully." -ForegroundColor Green
}
Pop-Location

# 3. Setup Frontend
Write-Host "`n[3/4] Setting up Frontend..." -ForegroundColor Yellow
$frontendEnv = Join-Path $baseDir "frontend\.env"
$frontendEnvExample = Join-Path $baseDir "frontend\.env.example"
if (-not (Test-Path $frontendEnv)) {
    if (Test-Path $frontendEnvExample) {
        Copy-Item $frontendEnvExample $frontendEnv
        Write-Host "Created frontend\.env from template." -ForegroundColor Cyan
    }
}

Push-Location (Join-Path $baseDir "frontend")
Write-Host "Installing frontend packages (react, vite, tailwindcss, recharts, lucide-react, etc.)..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ npm install encountered warnings or errors." -ForegroundColor Yellow
} else {
    Write-Host "✅ Frontend packages installed successfully." -ForegroundColor Green
}
Pop-Location

# 4. Database Setup Prompt
Write-Host "`n[4/4] MySQL Database Setup" -ForegroundColor Yellow
Write-Host "Ensure MySQL Server 8.0+ is running on this laptop." -ForegroundColor White
Write-Host "Before running database seeding, make sure your MySQL root password" -ForegroundColor White
Write-Host "in 'backend\.env' matches your local MySQL password." -ForegroundColor White

$seedChoice = Read-Host "`nDo you want to run the database seeder now? (Y/N) [Default: Y]"
if ($seedChoice -eq '' -or $seedChoice -match '^[Yy]') {
    Write-Host "`nRunning MySQL schema and seed data import..." -ForegroundColor Cyan
    Push-Location (Join-Path $baseDir "backend")
    npm run seed
    Pop-Location
} else {
    Write-Host "Skipped database seed. You can run 'npm run seed' inside 'backend' folder whenever ready." -ForegroundColor Gray
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete! To start the project, simply run:" -ForegroundColor Green
Write-Host "   .\start-all.ps1" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
