/* ==============================================
   STORAGE - Versión con localStorage
   Esta versión guarda los reclamos en el navegador.
   Funciona sin configurar nada, pero cada usuario
   ve SOLO sus propios reclamos.
   Para compartir reclamos entre vecinos usá
   storage-firebase.js en su lugar.
   ============================================== */

// Reclamos de ejemplo precargados (para que el mapa no se vea vacío al arrancar)
const RECLAMOS_DEMO = [
  { id: 'demo_1', cat: 'bache', title: 'Pozo enorme en la calle', desc: 'Hace meses que está, ya rompió varias cubiertas.', zone: 'Centro', lat: -24.2297, lng: -64.8660, createdAt: Date.now() - 86400000 * 5, votes: 3 },
  { id: 'demo_2', cat: 'luz', title: 'Luminaria quemada', desc: 'Toda la cuadra a oscuras de noche.', zone: 'Bº Ejército del Norte', lat: -24.2245, lng: -64.8640, createdAt: Date.now() - 86400000 * 2, votes: 1 },
  { id: 'demo_3', cat: 'basura', title: 'Basural a cielo abierto', desc: 'Se juntan residuos hace semanas, hay olor y moscas.', zone: 'Bº Libertad', lat: -24.2360, lng: -64.8620, createdAt: Date.now() - 86400000 * 7, votes: 8 },
  { id: 'demo_4', cat: 'agua', title: 'Pérdida de agua', desc: 'Se escapa agua de la red hace más de una semana.', zone: 'Bº Parapetí', lat: -24.2275, lng: -64.8545, createdAt: Date.now() - 86400000 * 10, votes: 4 },
  { id: 'demo_5', cat: 'dengue', title: 'Zona con mucho mosquito', desc: 'Necesitamos fumigación, hay varios casos de dengue.', zone: 'Bº Juan Pablo II', lat: -24.2380, lng: -64.8780, createdAt: Date.now() - 86400000 * 1, votes: 12 },
  { id: 'demo_6', cat: 'semaforo', title: 'Semáforo apagado', desc: 'Lleva días sin funcionar, ya hubo choques.', zone: 'Centro', lat: -24.2305, lng: -64.8680, createdAt: Date.now() - 86400000 * 3, votes: 6 },
  { id: 'demo_7', cat: 'arbol', title: 'Árbol a punto de caerse', desc: 'Está inclinado sobre cables de luz.', zone: 'Centro', lat: -24.2320, lng: -64.8670, createdAt: Date.now() - 86400000 * 4, votes: 2 },
  { id: 'demo_8', cat: 'vereda', title: 'Vereda rota', desc: 'Peligro para chicos y adultos mayores.', zone: 'Bº Ejército del Norte', lat: -24.2260, lng: -64.8615, createdAt: Date.now() - 86400000 * 6, votes: 1 },
  { id: 'demo_9', cat: 'inseguridad', title: 'Zona sin patrullaje', desc: 'Varios robos en la última semana.', zone: 'Mina Puloy', lat: -24.2330, lng: -64.8800, createdAt: Date.now() - 86400000 * 2, votes: 9 },
  { id: 'demo_10', cat: 'obra', title: 'Obra abandonada', desc: 'Cortaron el trabajo hace 2 años, es un peligro.', zone: 'Centro', lat: -24.2290, lng: -64.8625, createdAt: Date.now() - 86400000 * 15, votes: 5 }
];

window.afiStorage = {
  async loadAll() {
    const reclamos = {};

    // Si es la primera vez que el usuario abre la app, cargamos los demo
    const yaInicializado = localStorage.getItem('afi-inicializado');
    if (!yaInicializado) {
      try {
        RECLAMOS_DEMO.forEach(r => { reclamos[r.id] = r; });
        localStorage.setItem('afi-reclamos', JSON.stringify(RECLAMOS_DEMO));
        localStorage.setItem('afi-inicializado', 'true');
        console.log('[storage] Reclamos demo cargados:', RECLAMOS_DEMO.length);
        return reclamos;
      } catch (e) {
        console.error('[storage] Error cargando demo:', e);
      }
    }

    try {
      const raw = localStorage.getItem('afi-reclamos');
      if (raw) {
        const arr = JSON.parse(raw);
        arr.forEach(r => { reclamos[r.id] = r; });
        console.log('[storage] Reclamos cargados:', arr.length);
      }
    } catch (e) {
      console.error('[storage] Error cargando reclamos:', e);
    }
    return reclamos;
  },

  async save(reclamo) {
    try {
      const reclamos = await this.loadAll();
      reclamos[reclamo.id] = reclamo;
      localStorage.setItem('afi-reclamos', JSON.stringify(Object.values(reclamos)));
    } catch (e) {
      console.error('Error guardando reclamo:', e);
    }
  },

  async loadMyVotes() {
    try {
      const raw = localStorage.getItem('afi-my-votes');
      if (raw) return new Set(JSON.parse(raw));
    } catch (e) {}
    return new Set();
  },

  async saveMyVotes(votesSet) {
    try {
      localStorage.setItem('afi-my-votes', JSON.stringify(Array.from(votesSet)));
    } catch (e) {
      console.error('Error guardando votos:', e);
    }
  },

  // Para la versión local no hay "escucha en tiempo real"
  subscribeToChanges(callback) {
    // No hace nada. En Firebase sí se usa.
  }
};
