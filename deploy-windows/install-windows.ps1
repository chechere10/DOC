# ============================================
# Script de Instalación en Windows - FUNDAMUFA
# Este script se ejecuta EN el PC Windows
# ============================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FUNDAMUFA - Instalación en Windows   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$INSTALL_PATH = "C:\FUNDAMUFA"

# Función para verificar si un comando existe
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# ============================================
# 1. Instalar Node.js si no está instalado
# ============================================
Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Yellow

if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "  Node.js ya instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  Instalando Node.js..." -ForegroundColor Yellow
    
    # Descargar Node.js LTS
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    
    Write-Host "  Descargando Node.js desde nodejs.org..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
    
    Write-Host "  Ejecutando instalador..." -ForegroundColor Cyan
    Start-Process msiexec.exe -Wait -ArgumentList "/i `"$nodeInstaller`" /quiet /norestart"
    
    # Actualizar PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Remove-Item $nodeInstaller -Force
    
    Write-Host "  Node.js instalado correctamente" -ForegroundColor Green
}

# ============================================
# 2. Configurar variables de entorno
# ============================================
Write-Host "[2/5] Configurando variables de entorno..." -ForegroundColor Yellow

$envFile = "$INSTALL_PATH\backend\.env"
$envContent = @"
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="fundamufa-secret-key-2026-super-seguro"
PORT=3000
"@

Set-Content -Path $envFile -Value $envContent -Force
Write-Host "  Archivo .env creado" -ForegroundColor Green

# ============================================
# 3. Instalar dependencias del Backend
# ============================================
Write-Host "[3/5] Instalando dependencias del Backend..." -ForegroundColor Yellow

Set-Location "$INSTALL_PATH\backend"

# Refrescar PATH para usar npm
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

npm install 2>&1 | Out-Null
Write-Host "  Dependencias del backend instaladas" -ForegroundColor Green

# Generar cliente Prisma y migrar base de datos
Write-Host "  Configurando base de datos..." -ForegroundColor Cyan
npx prisma generate 2>&1 | Out-Null
npx prisma migrate deploy 2>&1 | Out-Null
npx prisma db seed 2>&1 | Out-Null
Write-Host "  Base de datos configurada" -ForegroundColor Green

# ============================================
# 4. Instalar dependencias del Frontend
# ============================================
Write-Host "[4/5] Instalando dependencias del Frontend..." -ForegroundColor Yellow

Set-Location "$INSTALL_PATH\frontend"
npm install 2>&1 | Out-Null
Write-Host "  Dependencias del frontend instaladas" -ForegroundColor Green

# ============================================
# 5. Configurar Firewall de Windows
# ============================================
Write-Host "[5/5] Configurando Firewall..." -ForegroundColor Yellow

# Agregar reglas de firewall para permitir acceso
try {
    New-NetFirewallRule -DisplayName "FUNDAMUFA Backend" -Direction Inbound -Port 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    New-NetFirewallRule -DisplayName "FUNDAMUFA Frontend" -Direction Inbound -Port 5173 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    Write-Host "  Reglas de firewall configuradas" -ForegroundColor Green
} catch {
    Write-Host "  Nota: Ejecutar como administrador para configurar firewall" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Instalación completada exitosamente  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
