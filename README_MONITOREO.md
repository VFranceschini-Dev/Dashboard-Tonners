# Sistema de Monitoreo de PCs - Donnet S.A.

## Descripción

Sistema que detecta PCs encendidas fuera del horario comercial (Lunes a Viernes 9:00 a 18:00 hs).

## Configuración en Supabase

1. Ir a Supabase → SQL Editor
2. Ejecutar el contenido de `sql/monitoreo_pcs.sql`
3. (Opcional) Ejecutar `sql/monitoreo_pcs_ejemplo.sql` para datos de prueba

## Instalación de Agentes

### Windows
1. Copiar `scripts/monitor_pc.ps1` a cada PC
2. Editar la variable `$Area` con el área correspondiente
3. Configurar en Programador de Tareas para ejecución automática

### Linux/Mac
1. Copiar `scripts/monitor_pc.sh` a cada PC
2. Dar permisos: `chmod +x monitor_pc.sh`
3. Agregar a crontab: `*/5 * * * * /ruta/monitor_pc.sh`

## Uso

1. Iniciar sesión en el dashboard
2. Ir a "Seguimiento PCs" en el menú lateral
3. Ver las PCs encendidas fuera de horario