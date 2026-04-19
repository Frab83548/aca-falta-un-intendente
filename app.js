/* ==============================================
   Acá falta un intendente - San Pedro de Jujuy
   Lógica principal
   ============================================== */

(function(){

  // --- Categorías de reclamos ---
  const CATEGORIES = [
    { id: 'bache',     label: 'Baches',              icon: '<path d="M3 18 L21 18 M6 18 L8 12 L11 14 L14 10 L17 13 L19 18" stroke="#000" stroke-width="2" fill="none" stroke-linejoin="round"/>' },
    { id: 'basura',    label: 'Basura / residuos',   icon: '<path d="M5 7 H19 L17.5 20 H6.5 Z M8 7 V5 H16 V7 M9 11 V16 M12 11 V16 M15 11 V16" stroke="#000" stroke-width="1.8" fill="none"/>' },
    { id: 'luz',       label: 'Alumbrado',           icon: '<path d="M12 3 L12 5 M6 7 L7.5 8.5 M18 7 L16.5 8.5 M12 5 A5 5 0 0 1 15 14 L15 17 H9 L9 14 A5 5 0 0 1 12 5 Z M10 19 H14 M11 21 H13" stroke="#000" stroke-width="1.8" fill="none" stroke-linecap="round"/>' },
    { id: 'agua',      label: 'Agua / cloacas',      icon: '<path d="M12 3 C12 3 6 10 6 15 A6 6 0 0 0 18 15 C18 10 12 3 12 3 Z" stroke="#000" stroke-width="1.8" fill="none"/>' },
    { id: 'semaforo',  label: 'Semáforo / tránsito', icon: '<rect x="8" y="3" width="8" height="18" rx="2" stroke="#000" stroke-width="1.8" fill="none"/><circle cx="12" cy="7.5" r="1.5" fill="#000"/><circle cx="12" cy="12" r="1.5" fill="#000"/><circle cx="12" cy="16.5" r="1.5" fill="#000"/>' },
    { id: 'arbol',     label: 'Arbolado',            icon: '<path d="M12 3 L6 12 H9 L5 19 H10 V21 H14 V19 H19 L15 12 H18 Z" stroke="#000" stroke-width="1.8" fill="none" stroke-linejoin="round"/>' },
    { id: 'inseguridad', label: 'Inseguridad',       icon: '<path d="M12 3 L4 6 V12 C4 17 8 20 12 21 C16 20 20 17 20 12 V6 Z" stroke="#000" stroke-width="1.8" fill="none"/><path d="M9 12 L11 14 L15 10" stroke="#000" stroke-width="1.8" fill="none" stroke-linecap="round"/>' },
    { id: 'vereda',    label: 'Veredas rotas',       icon: '<path d="M3 12 H21 M3 17 H21 M7 12 V17 M12 12 V17 M17 12 V17 M8 7 L10 5 L14 5 L16 7" stroke="#000" stroke-width="1.8" fill="none"/>' },
    { id: 'dengue',    label: 'Plagas / dengue',     icon: '<circle cx="12" cy="12" r="3" stroke="#000" stroke-width="1.8" fill="none"/><path d="M12 9 V4 M12 15 V20 M9 12 H4 M15 12 H20 M9.5 9.5 L6 6 M14.5 9.5 L18 6 M9.5 14.5 L6 18 M14.5 14.5 L18 18" stroke="#000" stroke-width="1.8" fill="none" stroke-linecap="round"/>' },
    { id: 'transporte',label: 'Transporte público',  icon: '<rect x="5" y="5" width="14" height="12" rx="2" stroke="#000" stroke-width="1.8" fill="none"/><circle cx="8" cy="19" r="1.5" stroke="#000" stroke-width="1.5" fill="none"/><circle cx="16" cy="19" r="1.5" stroke="#000" stroke-width="1.5" fill="none"/><path d="M5 11 H19 M8 8 H11 M13 8 H16" stroke="#000" stroke-width="1.5" fill="none"/>' },
    { id: 'obra',      label: 'Obras abandonadas',   icon: '<path d="M3 20 H21 M6 20 V12 L12 8 L18 12 V20 M10 20 V15 H14 V20" stroke="#000" stroke-width="1.8" fill="none" stroke-linejoin="round"/>' },
    { id: 'otro',      label: 'Otro',                icon: '<circle cx="12" cy="12" r="9" stroke="#000" stroke-width="1.8" fill="none"/><path d="M12 17 V17.5 M12 13 C12 11 14 10.5 14 9 A2 2 0 0 0 10 9" stroke="#000" stroke-width="1.8" fill="none" stroke-linecap="round"/>' }
  ];
  const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

  // --- Zonas conocidas de San Pedro de Jujuy ---
  const ZONAS = [
    { nombre: 'Centro (Plaza San Martín)', lat: -24.2297, lng: -64.8656, zoom: 16 },
    { nombre: 'Bº Ejército del Norte',     lat: -24.2245, lng: -64.8640, zoom: 16 },
    { nombre: 'Bº Libertad',               lat: -24.2360, lng: -64.8620, zoom: 16 },
    { nombre: 'Bº Parapetí',               lat: -24.2275, lng: -64.8545, zoom: 16 },
    { nombre: 'Bº Juan Pablo II',          lat: -24.2380, lng: -64.8780, zoom: 16 },
    { nombre: 'Mina Puloy',                lat: -24.2330, lng: -64.8800, zoom: 16 },
    { nombre: 'Ingenio La Esperanza',      lat: -24.2220, lng: -64.8370, zoom: 15 },
    { nombre: 'Vista general',             lat: -24.2310, lng: -64.8640, zoom: 14 }
  ];

  // --- Inicializar el mapa ---
  const loading = document.getElementById('afi-loading');

  const map = L.map('afi-map', {
    zoomControl: true,
    attributionControl: true,
    minZoom: 12,
    maxZoom: 19
  }).setView([-24.2310, -64.8640], 14);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO | Acá falta un intendente',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // --- Estado global de la app ---
  const state = {
    reclamos: {},
    filters: new Set(CATEGORIES.map(c => c.id)),
    markers: {},
    pickingLocation: false,
    pendingReclamo: null,
    selectedCat: 'bache',
    voted: new Set()
  };

  // --- Helpers ---
  function buildIcon(cat, count) {
    const c = CAT_MAP[cat] || CAT_MAP.otro;
    const bgColor = count >= 5 ? '#DC2626' : count >= 2 ? '#E85D1A' : '#F5C518';
    const html = '<div class="afi-marker-icon" style="background:' + bgColor + ';">' +
      '<svg viewBox="0 0 24 24" width="22" height="22">' + c.icon + '</svg>' +
      (count > 1 ? '<div style="position:absolute;bottom:-6px;right:-6px;background:#1a1a1a;color:#fff;font-size:11px;font-weight:500;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;">' + count + '</div>' : '') +
    '</div>';
    return L.divIcon({ html: html, className: '', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function relativeTime(ts){
    const diff = Date.now() - ts;
    const m = Math.floor(diff/60000);
    if (m < 1) return 'hace instantes';
    if (m < 60) return 'hace ' + m + ' min';
    const h = Math.floor(m/60);
    if (h < 24) return 'hace ' + h + ' h';
    const d = Math.floor(h/24);
    if (d < 30) return 'hace ' + d + ' día' + (d!==1?'s':'');
    return new Date(ts).toLocaleDateString('es-AR');
  }

  // --- Cluster de marcadores ---
  const cluster = L.markerClusterGroup({
    iconCreateFunction: function(cl){
      const n = cl.getChildCount();
      const cls = n >= 20 ? 'fire' : n >= 8 ? 'hot' : '';
      return L.divIcon({
        html: '<div class="afi-cluster-icon ' + cls + '">' + n + '</div>',
        className: '',
        iconSize: [40, 40]
      });
    },
    showCoverageOnHover: false,
    maxClusterRadius: 45
  });
  map.addLayer(cluster);

  // --- Sidebar de filtros ---
  const sidebar = document.getElementById('afi-sidebar');
  CATEGORIES.forEach(cat => {
    const chip = document.createElement('div');
    chip.className = 'afi-chip';
    chip.dataset.cat = cat.id;
    chip.innerHTML =
      '<svg viewBox="0 0 24 24">' + cat.icon + '</svg>' +
      '<span class="afi-count-badge" data-count="' + cat.id + '">0</span>' +
      '<span class="afi-tooltip">' + cat.label + '</span>';
    chip.addEventListener('click', () => toggleFilter(cat.id));
    sidebar.appendChild(chip);
  });

  function toggleFilter(catId){
    if (state.filters.has(catId)) state.filters.delete(catId);
    else state.filters.add(catId);
    refreshMarkers();
    updateSidebar();
  }

  function updateSidebar(){
    CATEGORIES.forEach(cat => {
      const chip = sidebar.querySelector('[data-cat="' + cat.id + '"]');
      const badge = sidebar.querySelector('[data-count="' + cat.id + '"]');
      const n = Object.values(state.reclamos).filter(r => r.cat === cat.id).length;
      if (badge) badge.textContent = n;
      if (chip) {
        if (!state.filters.has(cat.id)) chip.classList.add('off');
        else chip.classList.remove('off');
      }
    });
  }

  // --- Menú de zonas ---
  const zonesMenu = document.getElementById('afi-zones-menu');
  const zoneBtn = document.getElementById('afi-zone-btn');
  ZONAS.forEach(z => {
    const el = document.createElement('div');
    el.textContent = z.nombre;
    el.addEventListener('click', () => {
      map.flyTo([z.lat, z.lng], z.zoom, { duration: 0.7 });
      zonesMenu.classList.remove('show');
    });
    zonesMenu.appendChild(el);
  });
  zoneBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    zonesMenu.classList.toggle('show');
  });
  document.addEventListener('click', () => zonesMenu.classList.remove('show'));

  // --- Botón reset ---
  const resetBtn = document.getElementById('afi-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('¿Borrar todos los reclamos y volver a los de ejemplo?')) {
        try {
          localStorage.removeItem('afi-reclamos');
          localStorage.removeItem('afi-inicializado');
          localStorage.removeItem('afi-my-votes');
          location.reload();
        } catch (e) {
          alert('Error al resetear: ' + e.message);
        }
      }
    });
  }

  // --- Render de marcadores ---
  function refreshMarkers(){
    cluster.clearLayers();
    state.markers = {};
    Object.values(state.reclamos).forEach(r => {
      if (!state.filters.has(r.cat)) return;
      const icon = buildIcon(r.cat, (r.votes || 0) + 1);
      const marker = L.marker([r.lat, r.lng], { icon: icon });
      marker.bindPopup(buildPopup(r), { maxWidth: 260 });
      marker.on('popupopen', () => bindPopupHandlers(r.id));
      cluster.addLayer(marker);
      state.markers[r.id] = marker;
    });
  }

  function buildPopup(r){
    const c = CAT_MAP[r.cat] || CAT_MAP.otro;
    const votes = r.votes || 0;
    const hasVoted = state.voted.has(r.id);
    const timeAgo = relativeTime(r.createdAt);
    const fotoHtml = r.foto_url
      ? '<img src="' + escapeHtml(r.foto_url) + '" style="width:100%;max-height:150px;object-fit:cover;border-radius:6px;margin:6px 0;" />'
      : '';
    return '<div class="afi-popup">' +
      '<span class="cat">' + c.label + '</span>' +
      '<h4>' + escapeHtml(r.title) + '</h4>' +
      fotoHtml +
      (r.desc ? '<p>' + escapeHtml(r.desc) + '</p>' : '') +
      (r.zone ? '<p class="meta">📍 ' + escapeHtml(r.zone) + '</p>' : '') +
      '<p class="meta">Reclamo del ' + timeAgo + '</p>' +
      '<div class="vote">' +
        '<button data-vote-id="' + r.id + '"' + (hasVoted ? ' disabled style="opacity:0.5"' : '') + '>' +
          (hasVoted ? '✓ Te sumaste' : '+ Me pasa lo mismo') +
        '</button>' +
        '<span class="count">' + (votes + 1) + ' vecino' + (votes !== 0 ? 's' : '') + '</span>' +
      '</div>' +
    '</div>';
  }

  function bindPopupHandlers(id){
    setTimeout(() => {
      const btn = document.querySelector('[data-vote-id="' + id + '"]');
      if (btn && !btn.disabled) {
        btn.addEventListener('click', () => voteReclamo(id), { once: true });
      }
    }, 50);
  }

  async function voteReclamo(id){
    if (state.voted.has(id)) return;
    const r = state.reclamos[id];
    if (!r) return;

    // Optimistic update (actualizamos UI ya, después sincronizamos)
    r.votes = (r.votes || 0) + 1;
    state.voted.add(id);

    try {
      // Si el storage soporta votos granulares (Supabase), usamos addVote
      if (window.afiStorage.addVote) {
        await window.afiStorage.addVote(id);
      } else {
        // Fallback para localStorage: guardamos el reclamo con +1 voto
        await window.afiStorage.save(r);
        await window.afiStorage.saveMyVotes(state.voted);
      }
    } catch (e) {
      // Rollback si falló
      r.votes -= 1;
      state.voted.delete(id);
      alert('No se pudo registrar tu voto. Intentá de nuevo.');
      return;
    }

    if (state.markers[id]) {
      state.markers[id].setIcon(buildIcon(r.cat, r.votes + 1));
      state.markers[id].setPopupContent(buildPopup(r));
    }
    updateStats();
  }

  function updateStats(){
    const total = Object.keys(state.reclamos).length;
    const totalVotes = Object.values(state.reclamos).reduce((a,r)=> a + (r.votes||0) + 1, 0);
    document.getElementById('afi-stats').innerHTML =
      '<span><b>' + total + '</b> reclamos</span>' +
      '<span><b>' + totalVotes + '</b> vecinos</span>' +
      '<span>San Pedro de Jujuy</span>';
  }

  // --- Modal de nuevo reclamo ---
  const modal = document.getElementById('afi-modal');
  const catGrid = document.getElementById('afi-cat-grid');
  const hint = document.getElementById('afi-hint');

  CATEGORIES.forEach(cat => {
    const opt = document.createElement('div');
    opt.className = 'afi-cat-opt' + (cat.id === 'bache' ? ' selected' : '');
    opt.dataset.cat = cat.id;
    opt.title = cat.label;
    opt.innerHTML = '<svg viewBox="0 0 24 24">' + cat.icon + '</svg>';
    opt.addEventListener('click', () => {
      state.selectedCat = cat.id;
      catGrid.querySelectorAll('.afi-cat-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
    catGrid.appendChild(opt);
  });

  document.getElementById('afi-new-btn').addEventListener('click', () => openModal());
  document.getElementById('afi-cancel').addEventListener('click', () => closeModal());
  document.getElementById('afi-place').addEventListener('click', () => startPlacing());

  // Preview de foto en el modal
  const photoInput = document.getElementById('afi-photo');
  const photoPreview = document.getElementById('afi-photo-preview');
  const photoImg = document.getElementById('afi-photo-img');
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) {
        photoPreview.style.display = 'none';
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        photoImg.src = ev.target.result;
        photoPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }

  function openModal(){
    document.getElementById('afi-title').value = '';
    document.getElementById('afi-desc').value = '';
    document.getElementById('afi-zone').value = '';
    if (photoInput) photoInput.value = '';
    if (photoPreview) photoPreview.style.display = 'none';
    state.selectedCat = 'bache';
    catGrid.querySelectorAll('.afi-cat-opt').forEach(o => {
      o.classList.toggle('selected', o.dataset.cat === 'bache');
    });
    hint.textContent = 'Completá los datos y tocá "Ubicar en el mapa" para marcar el lugar.';
    modal.classList.add('show');
  }

  function closeModal(){
    modal.classList.remove('show');
    state.pickingLocation = false;
    state.pendingReclamo = null;
    map.getContainer().style.cursor = '';
  }

  function startPlacing(){
    const title = document.getElementById('afi-title').value.trim();
    if (!title){
      document.getElementById('afi-title').focus();
      document.getElementById('afi-title').style.borderColor = '#DC2626';
      return;
    }
    const photoFile = photoInput && photoInput.files[0] ? photoInput.files[0] : null;
    state.pendingReclamo = {
      _esNuevo: true,
      id: 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
      cat: state.selectedCat,
      title: title,
      desc: document.getElementById('afi-desc').value.trim(),
      zone: document.getElementById('afi-zone').value.trim(),
      createdAt: Date.now(),
      votes: 0,
      _photoFile: photoFile
    };
    state.pickingLocation = true;
    modal.classList.remove('show');
    map.getContainer().style.cursor = 'crosshair';
    showPlacingBanner();
  }

  function showPlacingBanner(){
    let banner = document.getElementById('afi-placing-banner');
    if (!banner){
      banner = document.createElement('div');
      banner.id = 'afi-placing-banner';
      banner.className = 'afi-placing-banner';
      document.querySelector('.afi-wrap').appendChild(banner);
    }
    banner.innerHTML = '📍 Tocá en el mapa el lugar exacto del reclamo <button id="afi-cancel-placing">Cancelar</button>';
    banner.style.display = 'block';
    document.getElementById('afi-cancel-placing').addEventListener('click', cancelPlacing, { once: true });
  }

  function hidePlacingBanner(){
    const b = document.getElementById('afi-placing-banner');
    if (b) b.style.display = 'none';
  }

  function cancelPlacing(){
    state.pickingLocation = false;
    state.pendingReclamo = null;
    map.getContainer().style.cursor = '';
    hidePlacingBanner();
  }

  map.on('click', async (e) => {
    if (!state.pickingLocation || !state.pendingReclamo) return;
    const r = state.pendingReclamo;
    r.lat = e.latlng.lat;
    r.lng = e.latlng.lng;

    state.pickingLocation = false;
    state.pendingReclamo = null;
    map.getContainer().style.cursor = '';
    hidePlacingBanner();

    try {
      // Si hay foto y el storage lo soporta, subirla primero
      if (r._photoFile && window.afiStorage.uploadPhoto) {
        loading.style.display = 'flex';
        loading.textContent = 'Subiendo foto...';
        r.foto_url = await window.afiStorage.uploadPhoto(r._photoFile);
        loading.style.display = 'none';
      }
      delete r._photoFile;

      await window.afiStorage.save(r);
      state.reclamos[r.id] = r;
      refreshMarkers();
      updateSidebar();
      updateStats();
      map.flyTo([r.lat, r.lng], Math.max(map.getZoom(), 17), { duration: 0.6 });
      setTimeout(() => {
        if (state.markers[r.id]) state.markers[r.id].openPopup();
      }, 700);
    } catch (err) {
      loading.style.display = 'none';
      alert('Error guardando el reclamo: ' + (err.message || err));
    }
  });

  // --- Carga inicial ---
  async function loadAll(){
    try {
      // Esperar a que el storage esté listo (Firebase es async)
      let retries = 0;
      while (!window.afiStorage && retries < 30) {
        await new Promise(r => setTimeout(r, 100));
        retries++;
      }
      if (!window.afiStorage) {
        console.error('[app] No se cargó window.afiStorage');
        loading.innerHTML = '<div style="text-align:center;padding:20px;">⚠ Error: no se pudo cargar el storage.<br><br>Si abriste el HTML con doble clic, probá usando un servidor local:<br><code style="background:#333;padding:4px 8px;border-radius:4px;margin-top:8px;display:inline-block;">python3 -m http.server 8000</code><br>y abrí http://localhost:8000</div>';
        return;
      }

      console.log('[app] Storage listo, cargando reclamos...');
      state.reclamos = await window.afiStorage.loadAll();
      console.log('[app] Reclamos cargados:', Object.keys(state.reclamos).length);

      state.voted = await window.afiStorage.loadMyVotes();
      console.log('[app] Votos del usuario:', state.voted.size);

      refreshMarkers();
      updateSidebar();
      updateStats();
      loading.style.display = 'none';

      // Si el storage soporta cambios en tiempo real (Firebase), suscribirse
      if (window.afiStorage.subscribeToChanges) {
        window.afiStorage.subscribeToChanges((nuevosReclamos) => {
          state.reclamos = nuevosReclamos;
          refreshMarkers();
          updateSidebar();
          updateStats();
        });
      }
    } catch (err) {
      console.error('[app] Error fatal en la carga:', err);
      loading.innerHTML = '<div style="text-align:center;padding:20px;">⚠ Error cargando la app:<br><br><code style="background:#333;padding:4px 8px;border-radius:4px;font-size:11px;">' + (err.message || err) + '</code><br><br>Abrí la consola (F12) para más detalles.</div>';
    }
  }

  loadAll();

  // Leaflet a veces necesita que le avisen que el contenedor cambió de tamaño
  setTimeout(() => map.invalidateSize(), 300);
  window.addEventListener('resize', () => map.invalidateSize());

})();
