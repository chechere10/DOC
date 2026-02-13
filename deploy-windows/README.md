# Guía de Instalación Remota - FUNDAMUFA en Windows

## Requisitos Previos en el PC Windows de tu tío:

1. **Habilitar OpenSSH Server en Windows:**
   - Ir a Configuración → Aplicaciones → Características opcionales
   - Agregar "OpenSSH Server"
   - Iniciar el servicio: `Start-Service sshd`
   - Configurar inicio automático: `Set-Service -Name sshd -StartupType Automatic`

2. **Obtener la IP del PC Windows:**
   - Abrir CMD y ejecutar: `ipconfig`
   - Anotar la dirección IPv4

3. **Conocer el usuario y contraseña de Windows**

## Desde tu PC Linux, ejecutar:

```bash
cd /home/hide/Documentos/DOC/sistema-medico
./deploy-windows/instalar-remoto.sh USUARIO@IP_WINDOWS
```

Ejemplo:
```bash
./deploy-windows/instalar-remoto.sh tio@192.168.1.100
```
