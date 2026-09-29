# ============================================
# AGENTE DE MONITOREO DE PCs (Windows PowerShell)
# ============================================

# Configuración
$SupabaseUrl = "https://rhrekvcmafcdpaptfypt.supabase.co"
$SupabaseKey = "sb_publishable_gLTIdMPhR9O8XFL6EKKoyQ_BcKtCreF"
$NombrePC = $env:COMPUTERNAME
$Usuario = $env:USERNAME
$Area = "Sin asignar"  # CAMBIAR según el área de la PC
$IpAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch "Loopback" } | Select-Object -First 1).IPAddress

function Reportar-Estado {
    param([string]$Estado)
    
    $body = @{
        nombre_pc = $NombrePC
        area = $Area
        usuario = $Usuario
        estado = $Estado
        ultima_conexion = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        ip_address = $IpAddress
    } | ConvertTo-Json
    
    $headers = @{
        "apikey" = $SupabaseKey
        "Authorization" = "Bearer $SupabaseKey"
        "Content-Type" = "application/json"
        "Prefer" = "resolution=merge-duplicates"
    }
    
    try {
        Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/monitoreo_pcs" -Method POST -Headers $headers -Body $body | Out-Null
        Write-Host "[$(Get-Date)] PC $NombrePC reportada como $Estado"
    } catch {
        Write-Error "Error al reportar estado: $_"
    }
}

Reportar-Estado -Estado "encendida"