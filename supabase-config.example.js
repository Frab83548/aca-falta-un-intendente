/* ==============================================
   SUPABASE CONFIG
   Pegá acá la URL y ANON KEY de tu proyecto.
   Las encontrás en: Project Settings → API
   ============================================== */

export const supabaseConfig = {
  url: "https://pbjyyxxvxowktuaytbkh.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBianl5eHh2eG93a3R1YXl0YmtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzQzNTksImV4cCI6MjA5MjExMDM1OX0.ZoS92VSLHgfDR3piFaHrDwa2C-WGEW-AK-Wn4oDdaq8"
};

/*
  La ANON KEY es PÚBLICA — está diseñada para estar en el frontend.
  La seguridad real viene de las Row Level Security (RLS) policies
  que configuraste en supabase-schema.sql.

  NUNCA pongas acá la SERVICE_ROLE KEY (esa sí es secreta y
  bypassea RLS).
*/
