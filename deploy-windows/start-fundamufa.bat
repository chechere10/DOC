@echo off
title FUNDAMUFA - Sistema Medico
color 0A

echo.
echo ========================================
echo    FUNDAMUFA - Iniciando Sistema
echo ========================================
echo.

cd /d C:\FUNDAMUFA

:: Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no esta instalado
    pause
    exit /b 1
)

:: Matar procesos anteriores si existen
taskkill /F /IM node.exe >nul 2>nul

:: Esperar un momento
timeout /t 2 /nobreak >nul

:: Iniciar Backend en segundo plano
echo Iniciando Backend en puerto 3000...
cd /d C:\FUNDAMUFA\backend
start /B /MIN cmd /c "node src/index.js"

:: Esperar a que el backend inicie
timeout /t 3 /nobreak >nul

:: Iniciar Frontend en segundo plano
echo Iniciando Frontend en puerto 5173...
cd /d C:\FUNDAMUFA\frontend
start /B /MIN cmd /c "npm run dev -- --host 0.0.0.0"

echo.
echo ========================================
echo    Sistema FUNDAMUFA iniciado
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo.
echo Para acceder desde otros dispositivos,
echo use la IP de este PC en vez de localhost
echo.
echo Esta ventana se puede minimizar.
echo NO LA CIERRE o el sistema se detendrá.
echo.

:: Mantener la ventana abierta pero minimizada
timeout /t 5 /nobreak >nul

:: Abrir navegador automáticamente
start http://localhost:5173

:: Mantener el script corriendo
:loop
timeout /t 60 /nobreak >nul
goto loop
