/* ==============================================
   SUPABASE CONFIG — PLANTILLA
   Copiá este archivo a supabase-config.js y completá
   los valores con los de tu proyecto.
   Lo encontrás en: Project Settings → API
   ============================================== */

export const supabaseConfig = {
  url: "https://TU-PROYECTO.supabase.co",
  anonKey: "TU_ANON_PUBLIC_KEY_AQUI"
};

/*
  La ANON KEY es PÚBLICA — está diseñada para estar en el frontend.
  La seguridad real viene de las Row Level Security (RLS) policies
  que configuraste en supabase-schema.sql.

  NUNCA pongas acá la SERVICE_ROLE KEY (esa sí es secreta y
  bypassea RLS).
*/
