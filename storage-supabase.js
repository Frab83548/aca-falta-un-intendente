/* ==============================================
   STORAGE - Versión con Supabase
   Base PostgreSQL + auth anónima + realtime + storage de fotos
   ==============================================

   Para usar esta versión:
   1. Creá un proyecto en https://app.supabase.com
   2. Ejecutá supabase-schema.sql en el SQL Editor
   3. Copiá tu URL y ANON KEY a supabase-config.js
   4. En index.html descomentá el <script> de este archivo
      y comentá el de storage-local.js
   ============================================== */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { supabaseConfig } from './supabase-config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: { persistSession: true, autoRefreshToken: true }
});

// ----------------------------------------------------------------
// AUTH ANÓNIMA
// Cada vecino recibe un user_id sin tener que registrarse.
// Supabase guarda la sesión en localStorage automáticamente,
// así que el mismo navegador = mismo usuario siempre.
// ----------------------------------------------------------------
async function ensureSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('[supabase] Error en signInAnonymously:', error);
    throw error;
  }
  console.log('[supabase] Sesión anónima creada:', data.user.id);
  return data.session;
}

// ----------------------------------------------------------------
// MAPEO DB <-> FRONTEND
// La app del frontend usa nombres cortos (cat, title, desc).
// La DB usa nombres descriptivos (categoria, titulo, descripcion).
// ----------------------------------------------------------------
function fromDB(row) {
  return {
    id: row.id,
    cat: row.categoria,
    title: row.titulo,
    desc: row.descripcion || '',
    zone: row.barrio || '',
    lat: row.lat,
    lng: row.lng,
    foto_url: row.foto_url || null,
    estado: row.estado,
    autor_id: row.autor_id,
    createdAt: new Date(row.created_at).getTime(),
    votes: row.votos_count || 0,
    // Datos del reclamante: la VISTA pública no los expone, así que
    // normalmente estos campos llegan vacíos. Solo se ven a sí mismo
    // cuando consulte la tabla `reclamos` con su sesión.
    nombre:   row.reclamante_nombre   || '',
    apellido: row.reclamante_apellido || '',
    telefono: row.reclamante_telefono || ''
  };
}

function toDB(reclamo, autorId) {
  return {
    titulo: reclamo.title,
    descripcion: reclamo.desc || null,
    categoria: reclamo.cat,
    lat: reclamo.lat,
    lng: reclamo.lng,
    barrio: reclamo.zone || null,
    foto_url: reclamo.foto_url || null,
    reclamante_nombre:   reclamo.nombre   || null,
    reclamante_apellido: reclamo.apellido || null,
    reclamante_telefono: reclamo.telefono || null,
    autor_id: autorId
  };
}

// ----------------------------------------------------------------
// INTERFACE EXPUESTA A app.js
// ----------------------------------------------------------------
window.afiStorage = {

  async loadAll() {
    await ensureSession();
    const reclamos = {};
    try {
      const { data, error } = await supabase
        .from('reclamos_con_votos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      data.forEach(row => {
        const r = fromDB(row);
        reclamos[r.id] = r;
      });
      console.log('[supabase] Reclamos cargados:', data.length);
    } catch (e) {
      console.error('[supabase] Error cargando reclamos:', e);
    }
    return reclamos;
  },

  async save(reclamo) {
    const session = await ensureSession();
    const userId = session.user.id;

    try {
      if (reclamo._esNuevo) {
        // Insert
        const { data, error } = await supabase
          .from('reclamos')
          .insert(toDB(reclamo, userId))
          .select()
          .single();
        if (error) throw error;

        // El id real lo pone la DB; actualizamos el objeto
        reclamo.id = data.id;
        reclamo.autor_id = data.autor_id;
        delete reclamo._esNuevo;
        console.log('[supabase] Reclamo creado:', data.id);
      } else {
        // Update (solo si es tuyo, RLS lo valida)
        const { error } = await supabase
          .from('reclamos')
          .update({
            titulo: reclamo.title,
            descripcion: reclamo.desc,
            categoria: reclamo.cat,
            barrio: reclamo.zone,
            foto_url: reclamo.foto_url
          })
          .eq('id', reclamo.id);
        if (error) throw error;
      }
    } catch (e) {
      console.error('[supabase] Error guardando reclamo:', e);
      throw e;
    }
  },

  // Devuelve los ids de reclamos que este usuario ya votó
  async loadMyVotes() {
    await ensureSession();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return new Set();

    try {
      const { data, error } = await supabase
        .from('votos')
        .select('reclamo_id')
        .eq('usuario_id', session.user.id);
      if (error) throw error;
      return new Set(data.map(v => v.reclamo_id));
    } catch (e) {
      console.error('[supabase] Error cargando votos:', e);
      return new Set();
    }
  },

  // Ya NO se usa (cada voto es una fila); lo dejamos como no-op
  async saveMyVotes(votesSet) {},

  // Suma un voto (insert en tabla votos)
  async addVote(reclamoId) {
    const session = await ensureSession();
    try {
      const { error } = await supabase
        .from('votos')
        .insert({
          reclamo_id: reclamoId,
          usuario_id: session.user.id
        });
      if (error && error.code !== '23505') throw error; // 23505 = duplicado (ya votó)
    } catch (e) {
      console.error('[supabase] Error al votar:', e);
      throw e;
    }
  },

  async removeVote(reclamoId) {
    const session = await ensureSession();
    try {
      const { error } = await supabase
        .from('votos')
        .delete()
        .eq('reclamo_id', reclamoId)
        .eq('usuario_id', session.user.id);
      if (error) throw error;
    } catch (e) {
      console.error('[supabase] Error al quitar voto:', e);
    }
  },

  // Sube una foto al storage y devuelve la URL pública
  async uploadPhoto(file) {
    const session = await ensureSession();
    const userId = session.user.id;
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${userId}/${Date.now()}.${ext}`;

    try {
      const { error: upErr } = await supabase.storage
        .from('reclamos-fotos')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;

      const { data } = supabase.storage
        .from('reclamos-fotos')
        .getPublicUrl(path);
      return data.publicUrl;
    } catch (e) {
      console.error('[supabase] Error subiendo foto:', e);
      throw e;
    }
  },

  // Suscripción realtime: recibir cambios al momento
  subscribeToChanges(callback) {
    const channel = supabase
      .channel('reclamos-cambios')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reclamos' },
        async () => {
          const reclamos = await this.loadAll();
          callback(reclamos);
        })
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'votos' },
        async () => {
          const reclamos = await this.loadAll();
          callback(reclamos);
        })
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // Cliente expuesto por si necesitás hacer queries específicas
  _client: supabase
};
