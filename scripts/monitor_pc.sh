#!/bin/bash

# ============================================
# AGENTE DE MONITOREO DE PCs (Linux/Mac)
# ============================================

# Configuración
SUPABASE_URL="https://rhrekvcmafcdpaptfypt.supabase.co"
SUPABASE_KEY="sb_publishable_gLTIdMPhR9O8XFL6EKKoyQ_BcKtCreF"
NOMBRE_PC=$(hostname)
USUARIO=$(whoami)
AREA="Sin asignar"  # CAMBIAR según el área de la PC
IP_ADDRESS=$(hostname -I | awk '{print $1}')

reportar_estado() {
    local estado=$1
    
    curl -X POST "${SUPABASE_URL}/rest/v1/monitoreo_pcs" \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: resolution=merge-duplicates" \
        -d "{
            \"nombre_pc\": \"${NOMBRE_PC}\",
            \"area\": \"${AREA}\",
            \"usuario\": \"${USUARIO}\",
            \"estado\": \"${estado}\",
            \"ultima_conexion\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
            \"ip_address\": \"${IP_ADDRESS}\"
        }" \
        -s > /dev/null
}

reportar_estado "encendida"
echo "[$(date)] PC ${NOMBRE_PC} reportada como encendida"