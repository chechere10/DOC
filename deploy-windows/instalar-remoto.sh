#!/bin/bash

# ============================================
# Script de Instalación Remota - FUNDAMUFA
# Desde Linux hacia Windows vía SSH
# ============================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     FUNDAMUFA - Instalación Remota en Windows              ║"
echo "║     Sistema Médico de Gestión                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar argumentos
if [ -z "$1" ]; then
    echo -e "${RED}Error: Debes proporcionar el usuario@ip del PC Windows${NC}"
    echo ""
    echo "Uso: ./instalar-remoto.sh usuario@ip"
    echo "Ejemplo: ./instalar-remoto.sh tio@192.168.1.100"
    exit 1
fi

REMOTE_HOST=$1
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
REMOTE_PATH="C:/FUNDAMUFA"

echo -e "${YELLOW}► Conectando a: $REMOTE_HOST${NC}"
echo ""

# Verificar conexión SSH
echo -e "${BLUE}[1/6] Verificando conexión SSH...${NC}"
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$REMOTE_HOST" "echo ok" 2>/dev/null; then
    echo -e "${YELLOW}Primera conexión - Se solicitará contraseña${NC}"
    echo -e "${YELLOW}Para evitar esto en el futuro, configuraremos SSH keys${NC}"
fi

# Crear directorio remoto
echo -e "${BLUE}[2/6] Preparando directorio en Windows...${NC}"
ssh "$REMOTE_HOST" "powershell -Command \"if (!(Test-Path '$REMOTE_PATH')) { New-Item -ItemType Directory -Path '$REMOTE_PATH' -Force }\""

# Copiar archivos del proyecto
echo -e "${BLUE}[3/6] Copiando archivos del sistema (esto puede tardar)...${NC}"
scp -r "$PROJECT_DIR/backend" "$REMOTE_HOST:$REMOTE_PATH/"
scp -r "$PROJECT_DIR/frontend" "$REMOTE_HOST:$REMOTE_PATH/"
scp "$SCRIPT_DIR/install-windows.ps1" "$REMOTE_HOST:$REMOTE_PATH/"
scp "$SCRIPT_DIR/setup-autostart.ps1" "$REMOTE_HOST:$REMOTE_PATH/"
scp "$SCRIPT_DIR/start-fundamufa.bat" "$REMOTE_HOST:$REMOTE_PATH/"

echo -e "${GREEN}✓ Archivos copiados exitosamente${NC}"

# Ejecutar script de instalación en Windows
echo -e "${BLUE}[4/6] Instalando Node.js y dependencias en Windows...${NC}"
ssh "$REMOTE_HOST" "powershell -ExecutionPolicy Bypass -File '$REMOTE_PATH/install-windows.ps1'"

# Configurar inicio automático
echo -e "${BLUE}[5/6] Configurando inicio automático...${NC}"
ssh "$REMOTE_HOST" "powershell -ExecutionPolicy Bypass -File '$REMOTE_PATH/setup-autostart.ps1'"

# Iniciar el sistema
echo -e "${BLUE}[6/6] Iniciando el sistema FUNDAMUFA...${NC}"
ssh "$REMOTE_HOST" "powershell -Command \"Start-Process '$REMOTE_PATH/start-fundamufa.bat' -WindowStyle Minimized\""

# Obtener IP de Windows para mostrar URL
WINDOWS_IP=$(echo "$REMOTE_HOST" | cut -d'@' -f2)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ INSTALACIÓN COMPLETADA EXITOSAMENTE                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}El sistema está funcionando en:${NC}"
echo ""
echo -e "   🌐 Frontend: ${GREEN}http://$WINDOWS_IP:5173${NC}"
echo -e "   🔧 Backend:  ${GREEN}http://$WINDOWS_IP:3000${NC}"
echo ""
echo -e "${YELLOW}Credenciales de acceso:${NC}"
echo -e "   Usuario: ${GREEN}admin${NC}"
echo -e "   Contraseña: ${GREEN}admin123${NC}"
echo ""
echo -e "   Usuario: ${GREEN}jorge${NC}"
echo -e "   Contraseña: ${GREEN}jorge123${NC}"
echo ""
echo -e "${BLUE}El sistema se iniciará automáticamente cada vez que${NC}"
echo -e "${BLUE}se encienda el PC Windows.${NC}"
echo ""
