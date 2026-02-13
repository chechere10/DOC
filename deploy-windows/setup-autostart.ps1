# ============================================
# Configurar Inicio Automático - FUNDAMUFA
# Este script configura el sistema para iniciar
# automáticamente cuando Windows arranque
# ============================================

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "Configurando inicio automático de FUNDAMUFA..." -ForegroundColor Cyan
Write-Host ""

$INSTALL_PATH = "C:\FUNDAMUFA"
$startupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$shortcutPath = "$startupFolder\FUNDAMUFA.lnk"
$targetPath = "$INSTALL_PATH\start-fundamufa.bat"

# Crear acceso directo en la carpeta de inicio
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $targetPath
$Shortcut.WorkingDirectory = $INSTALL_PATH
$Shortcut.WindowStyle = 7  # Minimizado
$Shortcut.Description = "Sistema Médico FUNDAMUFA"
$Shortcut.Save()

Write-Host "Acceso directo creado en: $shortcutPath" -ForegroundColor Green
Write-Host ""
Write-Host "FUNDAMUFA se iniciará automáticamente al encender el PC" -ForegroundColor Green
Write-Host ""

# También crear un acceso directo en el escritorio
$desktopPath = [Environment]::GetFolderPath("Desktop")
$desktopShortcut = "$desktopPath\FUNDAMUFA.lnk"

$Shortcut2 = $WshShell.CreateShortcut($desktopShortcut)
$Shortcut2.TargetPath = "http://localhost:5173"
$Shortcut2.Description = "Abrir Sistema FUNDAMUFA"
$Shortcut2.IconLocation = "C:\Windows\System32\shell32.dll,14"
$Shortcut2.Save()

Write-Host "Acceso directo creado en el escritorio" -ForegroundColor Green
