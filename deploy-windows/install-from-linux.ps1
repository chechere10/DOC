# ============================================
# FUNDAMUFA - Instalador desde Linux
# ============================================
# Este script se ejecuta en Windows y descarga todo desde tu Linux

$ErrorActionPreference = "Stop"
$LINUX_IP = "10.20.34.79"
$LINUX_PORT = "8080"
$BASE_URL = "http://${LINUX_IP}:${LINUX_PORT}"
$INSTALL_DIR = "C:\FUNDAMUFA"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FUNDAMUFA - Instalador Automatico" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar conexion con Linux
Write-Host "Verificando conexion con servidor Linux..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/package.json" -TimeoutSec 5 -UseBasicParsing
    Write-Host "Conexion exitosa!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: No se puede conectar a $BASE_URL" -ForegroundColor Red
    Write-Host "Asegurese de que en Linux este corriendo:" -ForegroundColor Yellow
    Write-Host "  cd /home/hide/Documentos/DOC/sistema-medico && python3 -m http.server 8080" -ForegroundColor White
    Read-Host "Presione Enter para salir"
    exit 1
}

# Verificar/Instalar Node.js
Write-Host ""
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
$nodeInstalled = $false
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "Node.js ya instalado: $nodeVersion" -ForegroundColor Green
        $nodeInstalled = $true
    }
} catch {}

if (-not $nodeInstalled) {
    Write-Host "Instalando Node.js..." -ForegroundColor Yellow
    
    # Descargar Node.js
    $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    $nodeMsi = "$env:TEMP\node-installer.msi"
    
    Write-Host "Descargando Node.js desde nodejs.org..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeMsi -UseBasicParsing
    
    Write-Host "Instalando Node.js (esto puede tomar unos minutos)..." -ForegroundColor Cyan
    Start-Process msiexec.exe -ArgumentList "/i", $nodeMsi, "/quiet", "/norestart" -Wait
    
    # Actualizar PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    
    Write-Host "Node.js instalado correctamente!" -ForegroundColor Green
}

# Crear directorio de instalacion
Write-Host ""
Write-Host "Creando directorio de instalacion..." -ForegroundColor Yellow
if (Test-Path $INSTALL_DIR) {
    Remove-Item -Path $INSTALL_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\backend" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\backend\src" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\backend\src\routes" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\backend\src\middleware" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\backend\prisma" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\backend\uploads" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\frontend" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\frontend\src" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\frontend\src\components" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\frontend\src\context" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\frontend\src\pages" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\frontend\src\services" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\frontend\src\assets" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\frontend\public" -Force | Out-Null

Write-Host "Directorio creado: $INSTALL_DIR" -ForegroundColor Green

# Funcion para descargar archivo
function Download-File {
    param($RemotePath, $LocalPath)
    try {
        $url = "$BASE_URL/$RemotePath"
        Invoke-WebRequest -Uri $url -OutFile $LocalPath -UseBasicParsing
        Write-Host "  OK: $RemotePath" -ForegroundColor Gray
    } catch {
        Write-Host "  ERROR: $RemotePath - $_" -ForegroundColor Red
    }
}

# Descargar archivos del Backend
Write-Host ""
Write-Host "Descargando Backend..." -ForegroundColor Yellow

Download-File "backend/package.json" "$INSTALL_DIR\backend\package.json"
Download-File "backend/src/index.js" "$INSTALL_DIR\backend\src\index.js"
Download-File "backend/src/middleware/auth.js" "$INSTALL_DIR\backend\src\middleware\auth.js"
Download-File "backend/src/routes/auth.js" "$INSTALL_DIR\backend\src\routes\auth.js"
Download-File "backend/src/routes/clientes.js" "$INSTALL_DIR\backend\src\routes\clientes.js"
Download-File "backend/src/routes/formulas.js" "$INSTALL_DIR\backend\src\routes\formulas.js"
Download-File "backend/src/routes/historias.js" "$INSTALL_DIR\backend\src\routes\historias.js"
Download-File "backend/src/routes/notas.js" "$INSTALL_DIR\backend\src\routes\notas.js"
Download-File "backend/prisma/schema.prisma" "$INSTALL_DIR\backend\prisma\schema.prisma"
Download-File "backend/prisma/seed.js" "$INSTALL_DIR\backend\prisma\seed.js"
Download-File "backend/prisma/dev.db" "$INSTALL_DIR\backend\prisma\dev.db"

# Descargar archivos del Frontend
Write-Host ""
Write-Host "Descargando Frontend..." -ForegroundColor Yellow

Download-File "frontend/package.json" "$INSTALL_DIR\frontend\package.json"
Download-File "frontend/index.html" "$INSTALL_DIR\frontend\index.html"
Download-File "frontend/vite.config.js" "$INSTALL_DIR\frontend\vite.config.js"
Download-File "frontend/eslint.config.js" "$INSTALL_DIR\frontend\eslint.config.js"
Download-File "frontend/src/main.jsx" "$INSTALL_DIR\frontend\src\main.jsx"
Download-File "frontend/src/App.jsx" "$INSTALL_DIR\frontend\src\App.jsx"
Download-File "frontend/src/index.css" "$INSTALL_DIR\frontend\src\index.css"
Download-File "frontend/src/components/Layout.jsx" "$INSTALL_DIR\frontend\src\components\Layout.jsx"
Download-File "frontend/src/components/ProtectedRoute.jsx" "$INSTALL_DIR\frontend\src\components\ProtectedRoute.jsx"
Download-File "frontend/src/components/ConfiguracionUsuarios.jsx" "$INSTALL_DIR\frontend\src\components\ConfiguracionUsuarios.jsx"
Download-File "frontend/src/components/ImprimirModal.jsx" "$INSTALL_DIR\frontend\src\components\ImprimirModal.jsx"
Download-File "frontend/src/context/AuthContext.jsx" "$INSTALL_DIR\frontend\src\context\AuthContext.jsx"
Download-File "frontend/src/pages/Inicio.jsx" "$INSTALL_DIR\frontend\src\pages\Inicio.jsx"
Download-File "frontend/src/pages/Login.jsx" "$INSTALL_DIR\frontend\src\pages\Login.jsx"
Download-File "frontend/src/pages/Clientes.jsx" "$INSTALL_DIR\frontend\src\pages\Clientes.jsx"
Download-File "frontend/src/pages/ClienteForm.jsx" "$INSTALL_DIR\frontend\src\pages\ClienteForm.jsx"
Download-File "frontend/src/pages/ClienteDetalle.jsx" "$INSTALL_DIR\frontend\src\pages\ClienteDetalle.jsx"
Download-File "frontend/src/pages/Historias.jsx" "$INSTALL_DIR\frontend\src\pages\Historias.jsx"
Download-File "frontend/src/pages/HistoriaForm.jsx" "$INSTALL_DIR\frontend\src\pages\HistoriaForm.jsx"
Download-File "frontend/src/pages/Formulas.jsx" "$INSTALL_DIR\frontend\src\pages\Formulas.jsx"
Download-File "frontend/src/pages/FormulaForm.jsx" "$INSTALL_DIR\frontend\src\pages\FormulaForm.jsx"
Download-File "frontend/src/pages/Notas.jsx" "$INSTALL_DIR\frontend\src\pages\Notas.jsx"
Download-File "frontend/src/pages/NotaForm.jsx" "$INSTALL_DIR\frontend\src\pages\NotaForm.jsx"
Download-File "frontend/src/services/api.js" "$INSTALL_DIR\frontend\src\services\api.js"
Download-File "frontend/public/logoo.png" "$INSTALL_DIR\frontend\public\logoo.png"

# Crear archivo .env para backend
Write-Host ""
Write-Host "Configurando Backend..." -ForegroundColor Yellow
@"
DATABASE_URL="file:./dev.db"
JWT_SECRET=fundamufa_secret_key_2026_super_segura
PORT=3000
"@ | Out-File -FilePath "$INSTALL_DIR\backend\.env" -Encoding UTF8

# Instalar dependencias del Backend
Write-Host ""
Write-Host "Instalando dependencias del Backend..." -ForegroundColor Yellow
Set-Location "$INSTALL_DIR\backend"
npm install --silent 2>$null
npx prisma generate --silent 2>$null
Write-Host "Backend configurado!" -ForegroundColor Green

# Instalar dependencias del Frontend  
Write-Host ""
Write-Host "Instalando dependencias del Frontend..." -ForegroundColor Yellow
Set-Location "$INSTALL_DIR\frontend"
npm install --silent 2>$null
Write-Host "Frontend configurado!" -ForegroundColor Green

# Crear script de inicio
Write-Host ""
Write-Host "Creando script de inicio..." -ForegroundColor Yellow
@"
@echo off
title FUNDAMUFA - Sistema Medico
color 0A

echo.
echo ========================================
echo    FUNDAMUFA - Iniciando Sistema
echo ========================================
echo.

cd /d C:\FUNDAMUFA

taskkill /F /IM node.exe >nul 2>nul
timeout /t 2 /nobreak >nul

echo Iniciando Backend...
cd /d C:\FUNDAMUFA\backend
start /B cmd /c "node src/index.js"

timeout /t 3 /nobreak >nul

echo Iniciando Frontend...
cd /d C:\FUNDAMUFA\frontend
start /B cmd /c "npm run dev -- --host 0.0.0.0"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo    Sistema FUNDAMUFA iniciado!
echo ========================================
echo.
echo Abriendo navegador...
start http://localhost:5173

echo.
echo Usuario: admin
echo Clave: admin123
echo.
echo NO CIERRE esta ventana.
echo.

:loop
timeout /t 60 /nobreak >nul
goto loop
"@ | Out-File -FilePath "$INSTALL_DIR\start-fundamufa.bat" -Encoding ASCII

# Crear acceso directo en el escritorio
Write-Host "Creando acceso directo en el escritorio..." -ForegroundColor Yellow
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\FUNDAMUFA.lnk")
$Shortcut.TargetPath = "$INSTALL_DIR\start-fundamufa.bat"
$Shortcut.WorkingDirectory = $INSTALL_DIR
$Shortcut.IconLocation = "shell32.dll,23"
$Shortcut.Description = "Sistema Medico FUNDAMUFA"
$Shortcut.Save()

# Agregar al inicio de Windows
Write-Host "Configurando inicio automatico..." -ForegroundColor Yellow
$StartupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
Copy-Item "$INSTALL_DIR\start-fundamufa.bat" "$StartupFolder\FUNDAMUFA.bat" -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   INSTALACION COMPLETADA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "El sistema se ha instalado en: C:\FUNDAMUFA" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar el sistema:" -ForegroundColor Yellow
Write-Host "  - Doble clic en 'FUNDAMUFA' en el escritorio" -ForegroundColor White
Write-Host "  - O ejecute: C:\FUNDAMUFA\start-fundamufa.bat" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales:" -ForegroundColor Yellow
Write-Host "  Usuario: admin" -ForegroundColor White
Write-Host "  Clave: admin123" -ForegroundColor White
Write-Host ""
Write-Host "El sistema se iniciara automaticamente" -ForegroundColor Cyan
Write-Host "cada vez que se encienda el PC." -ForegroundColor Cyan
Write-Host ""

# Preguntar si iniciar ahora
$iniciar = Read-Host "Desea iniciar el sistema ahora? (S/N)"
if ($iniciar -eq "S" -or $iniciar -eq "s") {
    Start-Process "$INSTALL_DIR\start-fundamufa.bat"
}

Write-Host ""
Write-Host "Presione Enter para cerrar..."
Read-Host
