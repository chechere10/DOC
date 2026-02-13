#!/bin/bash
# =============================================================================
# FUNDAMUFA - Script de Instalación Completa Remota
# Instala TODO el sistema en Windows desde Linux vía SSH
# =============================================================================

# Configuración
WINDOWS_IP="10.20.34.73"
WINDOWS_USER="Sergio"
WINDOWS_PASS="714310"
PROJECT_DIR="/home/hide/Documentos/DOC/sistema-medico"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funciones
run_ssh() {
    sshpass -p "$WINDOWS_PASS" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=60 "$WINDOWS_USER@$WINDOWS_IP" "$1"
}

run_ps() {
    sshpass -p "$WINDOWS_PASS" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=120 "$WINDOWS_USER@$WINDOWS_IP" "powershell -Command \"$1\""
}

copy_file() {
    sshpass -p "$WINDOWS_PASS" scp -o StrictHostKeyChecking=no "$1" "$WINDOWS_USER@$WINDOWS_IP:$2"
}

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   FUNDAMUFA - Instalación Remota en Windows${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# ============================================================================
# PASO 1: Verificar conexión
# ============================================================================
echo -e "${YELLOW}[1/7] Verificando conexión SSH...${NC}"
if run_ssh "echo OK" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Conexión exitosa${NC}"
else
    echo -e "${RED}  ✗ No se puede conectar${NC}"
    exit 1
fi

# ============================================================================
# PASO 2: Instalar Node.js si no existe
# ============================================================================
echo -e "${YELLOW}[2/7] Verificando Node.js...${NC}"
NODE_EXISTS=$(run_ssh "if exist \"C:\\Program Files\\nodejs\\node.exe\" (echo YES) else (echo NO)")

if [[ "$NODE_EXISTS" == *"NO"* ]]; then
    echo -e "${YELLOW}  Descargando Node.js...${NC}"
    run_ps "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile 'C:\\Users\\$WINDOWS_USER\\node.msi'"
    
    echo -e "${YELLOW}  Instalando Node.js (espere 60 segundos)...${NC}"
    run_ssh "msiexec /i C:\\Users\\$WINDOWS_USER\\node.msi /quiet /norestart"
    sleep 60
    
    # Verificar
    NODE_VER=$(run_ssh "\"C:\\Program Files\\nodejs\\node.exe\" --version 2>nul")
    echo -e "${GREEN}  ✓ Node.js instalado: $NODE_VER${NC}"
else
    echo -e "${GREEN}  ✓ Node.js ya existe${NC}"
fi

# ============================================================================
# PASO 3: Limpiar y crear carpetas
# ============================================================================
echo -e "${YELLOW}[3/7] Preparando carpetas en Windows...${NC}"
run_ssh "rmdir /S /Q C:\\FUNDAMUFA 2>nul"
run_ssh "mkdir C:\\FUNDAMUFA"
run_ssh "mkdir C:\\FUNDAMUFA\\backend"
run_ssh "mkdir C:\\FUNDAMUFA\\backend\\prisma"
run_ssh "mkdir C:\\FUNDAMUFA\\backend\\prisma\\migrations"
run_ssh "mkdir C:\\FUNDAMUFA\\backend\\src"
run_ssh "mkdir C:\\FUNDAMUFA\\backend\\src\\routes"
run_ssh "mkdir C:\\FUNDAMUFA\\backend\\src\\middleware"
run_ssh "mkdir C:\\FUNDAMUFA\\backend\\src\\controllers"
run_ssh "mkdir C:\\FUNDAMUFA\\backend\\uploads"
run_ssh "mkdir C:\\FUNDAMUFA\\frontend"
run_ssh "mkdir C:\\FUNDAMUFA\\frontend\\src"
run_ssh "mkdir C:\\FUNDAMUFA\\frontend\\src\\pages"
run_ssh "mkdir C:\\FUNDAMUFA\\frontend\\src\\components"
run_ssh "mkdir C:\\FUNDAMUFA\\frontend\\src\\context"
run_ssh "mkdir C:\\FUNDAMUFA\\frontend\\src\\services"
run_ssh "mkdir C:\\FUNDAMUFA\\frontend\\src\\assets"
run_ssh "mkdir C:\\FUNDAMUFA\\frontend\\public"
echo -e "${GREEN}  ✓ Carpetas creadas${NC}"

# ============================================================================
# PASO 4: Copiar archivos del backend
# ============================================================================
echo -e "${YELLOW}[4/7] Copiando archivos del backend...${NC}"

# Backend raíz
copy_file "$PROJECT_DIR/backend/package.json" "C:/FUNDAMUFA/backend/package.json"
copy_file "$PROJECT_DIR/backend/package-lock.json" "C:/FUNDAMUFA/backend/package-lock.json"
copy_file "$PROJECT_DIR/backend/.env" "C:/FUNDAMUFA/backend/.env"
copy_file "$PROJECT_DIR/backend/.gitignore" "C:/FUNDAMUFA/backend/.gitignore"

# Backend src
copy_file "$PROJECT_DIR/backend/src/index.js" "C:/FUNDAMUFA/backend/src/index.js"

# Backend routes
for f in "$PROJECT_DIR/backend/src/routes/"*.js; do
    copy_file "$f" "C:/FUNDAMUFA/backend/src/routes/$(basename $f)"
done

# Backend middleware
for f in "$PROJECT_DIR/backend/src/middleware/"*.js; do
    copy_file "$f" "C:/FUNDAMUFA/backend/src/middleware/$(basename $f)"
done

# Prisma
copy_file "$PROJECT_DIR/backend/prisma/schema.prisma" "C:/FUNDAMUFA/backend/prisma/schema.prisma"
copy_file "$PROJECT_DIR/backend/prisma/seed.js" "C:/FUNDAMUFA/backend/prisma/seed.js"

echo -e "${GREEN}  ✓ Backend copiado${NC}"

# ============================================================================
# PASO 5: Copiar archivos del frontend
# ============================================================================
echo -e "${YELLOW}[5/7] Copiando archivos del frontend...${NC}"

# Frontend raíz
copy_file "$PROJECT_DIR/frontend/package.json" "C:/FUNDAMUFA/frontend/package.json"
copy_file "$PROJECT_DIR/frontend/package-lock.json" "C:/FUNDAMUFA/frontend/package-lock.json"
copy_file "$PROJECT_DIR/frontend/vite.config.js" "C:/FUNDAMUFA/frontend/vite.config.js"
copy_file "$PROJECT_DIR/frontend/index.html" "C:/FUNDAMUFA/frontend/index.html"
copy_file "$PROJECT_DIR/frontend/eslint.config.js" "C:/FUNDAMUFA/frontend/eslint.config.js"

# Frontend src
copy_file "$PROJECT_DIR/frontend/src/App.jsx" "C:/FUNDAMUFA/frontend/src/App.jsx"
copy_file "$PROJECT_DIR/frontend/src/main.jsx" "C:/FUNDAMUFA/frontend/src/main.jsx"
copy_file "$PROJECT_DIR/frontend/src/index.css" "C:/FUNDAMUFA/frontend/src/index.css"

# Frontend pages
for f in "$PROJECT_DIR/frontend/src/pages/"*.jsx; do
    copy_file "$f" "C:/FUNDAMUFA/frontend/src/pages/$(basename $f)"
done

# Frontend components
for f in "$PROJECT_DIR/frontend/src/components/"*.jsx; do
    copy_file "$f" "C:/FUNDAMUFA/frontend/src/components/$(basename $f)"
done

# Frontend context
for f in "$PROJECT_DIR/frontend/src/context/"*.jsx; do
    copy_file "$f" "C:/FUNDAMUFA/frontend/src/context/$(basename $f)"
done

# Frontend services
for f in "$PROJECT_DIR/frontend/src/services/"*.js; do
    copy_file "$f" "C:/FUNDAMUFA/frontend/src/services/$(basename $f)"
done

# Frontend assets
copy_file "$PROJECT_DIR/frontend/src/assets/react.svg" "C:/FUNDAMUFA/frontend/src/assets/react.svg"

# Frontend public
copy_file "$PROJECT_DIR/frontend/public/logoo.png" "C:/FUNDAMUFA/frontend/public/logoo.png"
copy_file "$PROJECT_DIR/frontend/public/vite.svg" "C:/FUNDAMUFA/frontend/public/vite.svg"

echo -e "${GREEN}  ✓ Frontend copiado${NC}"

# ============================================================================
# PASO 6: Instalar dependencias y configurar BD
# ============================================================================
echo -e "${YELLOW}[6/7] Instalando dependencias (3-5 minutos)...${NC}"

echo -e "${YELLOW}  Instalando backend...${NC}"
run_ssh "cd C:\\FUNDAMUFA\\backend && \"C:\\Program Files\\nodejs\\npm.cmd\" install --silent 2>&1"

echo -e "${YELLOW}  Instalando frontend...${NC}"
run_ssh "cd C:\\FUNDAMUFA\\frontend && \"C:\\Program Files\\nodejs\\npm.cmd\" install --silent 2>&1"

echo -e "${YELLOW}  Configurando base de datos...${NC}"
run_ssh "cd C:\\FUNDAMUFA\\backend && \"C:\\Program Files\\nodejs\\npx.cmd\" prisma generate 2>&1"
run_ssh "cd C:\\FUNDAMUFA\\backend && \"C:\\Program Files\\nodejs\\npx.cmd\" prisma db push 2>&1"
run_ssh "cd C:\\FUNDAMUFA\\backend && \"C:\\Program Files\\nodejs\\node.exe\" prisma/seed.js 2>&1"

echo -e "${GREEN}  ✓ Dependencias instaladas${NC}"

# ============================================================================
# PASO 7: Crear scripts de inicio y acceso directo
# ============================================================================
echo -e "${YELLOW}[7/7] Configurando inicio automático...${NC}"

# Crear script de inicio
run_ps "
Set-Content -Path 'C:\\FUNDAMUFA\\iniciar.bat' -Value @'
@echo off
title FUNDAMUFA - Sistema Medico
color 0A
echo Iniciando FUNDAMUFA...
cd /d C:\\FUNDAMUFA
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
start \"Backend\" /MIN cmd /c \"cd /d C:\\FUNDAMUFA\\backend && \"C:\\Program Files\\nodejs\\node.exe\" src/index.js\"
timeout /t 3 /nobreak >nul
start \"Frontend\" /MIN cmd /c \"cd /d C:\\FUNDAMUFA\\frontend && \"C:\\Program Files\\nodejs\\npm.cmd\" run dev -- --host 0.0.0.0\"
timeout /t 8 /nobreak >nul
start http://localhost:5173
echo Sistema iniciado correctamente!
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3000
echo.
echo Puede cerrar esta ventana.
'@
"

# Crear acceso directo en escritorio
run_ps "
\$ws = New-Object -ComObject WScript.Shell
\$sc = \$ws.CreateShortcut(\"\$env:USERPROFILE\\Desktop\\FUNDAMUFA.lnk\")
\$sc.TargetPath = 'C:\\FUNDAMUFA\\iniciar.bat'
\$sc.WorkingDirectory = 'C:\\FUNDAMUFA'
\$sc.Save()
"

# Agregar al inicio de Windows
run_ps "
\$startup = [Environment]::GetFolderPath('Startup')
Copy-Item 'C:\\FUNDAMUFA\\iniciar.bat' \"\$startup\\FUNDAMUFA.bat\" -Force
"

echo -e "${GREEN}  ✓ Inicio automático configurado${NC}"

# ============================================================================
# PASO FINAL: Iniciar el sistema
# ============================================================================
echo ""
echo -e "${YELLOW}Iniciando sistema FUNDAMUFA...${NC}"
run_ssh "start C:\\FUNDAMUFA\\iniciar.bat"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "Acceso desde Windows:  ${BLUE}http://localhost:5173${NC}"
echo -e "Acceso desde tu Linux: ${BLUE}http://$WINDOWS_IP:5173${NC}"
echo ""
echo -e "Credenciales:"
echo -e "  Usuario: ${GREEN}admin${NC}  Contraseña: ${GREEN}admin123${NC}"
echo -e "  Usuario: ${GREEN}jorge${NC}  Contraseña: ${GREEN}jorge123${NC}"
echo ""
echo -e "El sistema inicia automáticamente con Windows."
echo -e "Hay un acceso directo en el Escritorio."
echo ""
