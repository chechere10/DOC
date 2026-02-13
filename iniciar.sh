#!/bin/bash

# ========================================
# 🏥 Sistema Médico FUNDAMUFA
# Script de inicio automático
# ========================================

echo ""
echo "🏥 =========================================="
echo "   Sistema Médico FUNDAMUFA"
echo "   Iniciando servidores..."
echo "==========================================="
echo ""

# Colores para la terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sin color

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo servidores...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servidores detenidos correctamente${NC}"
    exit 0
}

# Capturar Ctrl+C para limpiar
trap cleanup SIGINT SIGTERM

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js no está instalado${NC}"
    echo "Por favor instale Node.js 18+ antes de continuar"
    exit 1
fi

echo -e "${BLUE}📦 Verificando dependencias...${NC}"

# Verificar e instalar dependencias del backend
if [ ! -d "$BASE_DIR/backend/node_modules" ]; then
    echo -e "${YELLOW}📥 Instalando dependencias del backend...${NC}"
    cd "$BASE_DIR/backend" && npm install
fi

# Verificar e instalar dependencias del frontend
if [ ! -d "$BASE_DIR/frontend/node_modules" ]; then
    echo -e "${YELLOW}📥 Instalando dependencias del frontend...${NC}"
    cd "$BASE_DIR/frontend" && npm install
fi

# Verificar si la base de datos existe
if [ ! -f "$BASE_DIR/backend/prisma/dev.db" ]; then
    echo -e "${YELLOW}🗄️ Configurando base de datos...${NC}"
    cd "$BASE_DIR/backend"
    npx prisma generate
    npx prisma migrate dev --name init
    npm run db:seed
fi

echo ""
echo -e "${GREEN}🚀 Iniciando Backend (Puerto 3001)...${NC}"
cd "$BASE_DIR/backend"
npm start &
BACKEND_PID=$!

# Esperar a que el backend inicie
sleep 3

echo -e "${GREEN}🚀 Iniciando Frontend (Puerto 5173)...${NC}"
cd "$BASE_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

# Esperar un poco para que el frontend inicie
sleep 3

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ Sistema iniciado correctamente!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "🌐 Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "🔌 Backend:  ${BLUE}http://localhost:3001${NC}"
echo ""
echo -e "📧 Usuario: ${YELLOW}admin${NC}"
echo -e "🔑 Clave:   ${YELLOW}admin123${NC}"
echo ""
echo -e "${YELLOW}Presione Ctrl+C para detener los servidores${NC}"
echo ""

# Mantener el script corriendo
wait
