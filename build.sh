#!/bin/bash
# ============================================================
# Build script para Vercel
# Genera supabase-config.js desde las variables de entorno
# ============================================================

set -e

echo "→ Generando supabase-config.js desde variables de entorno..."

# Validar que las variables existan
if [ -z "$VITE_SUPABASE_URL" ]; then
  echo "✗ ERROR: la variable VITE_SUPABASE_URL no está configurada en Vercel."
  echo "  Andá a Project Settings → Environment Variables y agregala."
  exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "✗ ERROR: la variable VITE_SUPABASE_ANON_KEY no está configurada en Vercel."
  echo "  Andá a Project Settings → Environment Variables y agregala."
  exit 1
fi

# Generar el archivo de config
cat > supabase-config.js <<EOF
// Archivo generado automáticamente por build.sh
// NO editar manualmente — los valores vienen de Vercel Environment Variables
export const supabaseConfig = {
  url: "${VITE_SUPABASE_URL}",
  anonKey: "${VITE_SUPABASE_ANON_KEY}"
};
EOF

echo "✓ supabase-config.js generado correctamente"
echo "✓ URL: ${VITE_SUPABASE_URL}"
echo "✓ Anon key: ${VITE_SUPABASE_ANON_KEY:0:20}... (${#VITE_SUPABASE_ANON_KEY} chars)"
