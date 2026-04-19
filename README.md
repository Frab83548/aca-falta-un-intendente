# Acá falta un intendente — San Pedro de Jujuy

Mapa colaborativo de reclamos ciudadanos, inspirado en el proyecto original de Rosario.

## Estructura del proyecto

```
aca-falta-un-intendente/
├── index.html              ← Página principal
├── styles.css              ← Estilos
├── app.js                  ← Lógica del mapa y los reclamos
├── storage-local.js        ← Backend simple (localStorage)
├── storage-firebase.js     ← Backend compartido (Firebase)
├── firebase-config.js      ← Config de Firebase (hay que llenarla)
└── README.md               ← Este archivo
```

---

## 🚀 Despliegue rápido (modo local — 2 minutos)

Esta opción funciona **sin configurar nada**, pero cada vecino ve solo sus propios reclamos en su navegador.

### Opción A — Netlify Drop (lo más fácil)

1. Entrá a https://app.netlify.com/drop
2. Arrastrá toda la carpeta del proyecto ahí
3. Listo, tenés una URL pública tipo `https://nombre-random.netlify.app`

### Opción B — Vercel

1. Subí la carpeta a GitHub como un repositorio
2. Entrá a https://vercel.com, conectá tu cuenta de GitHub
3. Importá el repo y desplegá (Vercel detecta solo que es HTML estático)

### Opción C — GitHub Pages

1. Subí la carpeta a un repositorio de GitHub
2. En el repo, andá a **Settings → Pages**
3. En "Source" elegí la rama `main` y carpeta `/ (root)`
4. Guardá. En unos segundos tenés la URL `https://tu-usuario.github.io/nombre-del-repo/`

### Opción D — Probar en tu máquina

Solo abrir `index.html` en el navegador NO funciona del todo bien (los módulos necesitan servidor). Usá:

```bash
# con Python (ya viene instalado en Linux/Mac)
python3 -m http.server 8000

# o con Node.js
npx serve
```

Después entrá a http://localhost:8000

---

## 🌎 Modo compartido (Firebase — 5 minutos)

Para que **todos los vecinos vean los mismos reclamos y se sumen en tiempo real**, usá Firebase Firestore (gratis hasta 50.000 lecturas y 20.000 escrituras por día, más que suficiente).

### Paso 1: Crear proyecto en Firebase

1. Entrá a https://console.firebase.google.com
2. Tocá "Agregar proyecto", poné un nombre (ej: `aca-falta-sanpedro`)
3. Desactivá Google Analytics si querés (no hace falta)
4. Creá el proyecto

### Paso 2: Crear la base de datos Firestore

1. En el menú izquierdo, tocá **Build → Firestore Database**
2. Tocá **"Crear base de datos"**
3. Elegí **"Iniciar en modo de prueba"** (permite lectura/escritura pública por 30 días)
4. Elegí la región `southamerica-east1` (São Paulo, más cerca de Argentina)

### Paso 3: Obtener la config

1. En Firebase, tocá el ícono del engranaje ⚙️ (arriba a la izquierda) → **"Configuración del proyecto"**
2. Bajá hasta **"Tus apps"** y tocá el ícono `</>` (web)
3. Registrá la app con cualquier nombre (ej: `web`)
4. Te va a mostrar un bloque de código con un objeto `firebaseConfig`. Copialo.

### Paso 4: Pegar la config en el proyecto

Abrí `firebase-config.js` y pegá tus valores reales:

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "aca-falta-sanpedro.firebaseapp.com",
  projectId: "aca-falta-sanpedro",
  storageBucket: "aca-falta-sanpedro.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcd1234567890"
};
```

### Paso 5: Activar el storage de Firebase en el HTML

Abrí `index.html`, buscá la sección del backend y comentá el local, descomentá el de Firebase:

```html
<!-- Opción A: LocalStorage -->
<!-- <script src="storage-local.js"></script> -->

<!-- Opción B: Firebase -->
<script type="module" src="storage-firebase.js"></script>
```

### Paso 6: Reglas de seguridad de Firestore (IMPORTANTE)

Por defecto Firebase deja todo abierto durante 30 días. Después de eso deja de funcionar. Para evitarlo, andá a **Firestore Database → Reglas** y pegá esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reclamos/{reclamoId} {
      // Cualquiera puede leer y escribir reclamos
      // (lo restringimos en la app con validaciones)
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['id', 'cat', 'title', 'lat', 'lng', 'createdAt'])
                    && request.resource.data.title.size() <= 80
                    && request.resource.data.title.size() > 0;
      allow update: if request.resource.data.id == resource.data.id;
      allow delete: if false;
    }
  }
}
```

Guardá y listo. Desplegá como en el modo local.

---

## ⚙️ Personalización

### Cambiar de ciudad

En `app.js`, buscá la línea:

```javascript
}).setView([-24.2310, -64.8640], 14);
```

Y cambiá las coordenadas por las de tu ciudad.

También cambiá el array `ZONAS` para tener los barrios/zonas de tu ciudad.

### Agregar más categorías

En `app.js`, editá el array `CATEGORIES` al principio del archivo. Cada categoría tiene un `id`, un `label` y un `icon` (SVG path).

---

## 🛠️ Tecnologías usadas

- **Leaflet** — librería de mapas interactivos (open source)
- **OpenStreetMap + CartoDB** — tiles del mapa (gratis)
- **Leaflet.markercluster** — agrupación de marcadores
- **Firebase Firestore** (opcional) — base de datos compartida en tiempo real

Todo el proyecto es HTML/CSS/JS puro, sin frameworks. Funciona como sitio estático en cualquier hosting.

---

## 📝 Licencia

Inspirado en el proyecto "Acá falta un intendente" de Rosario. Sentite libre de adaptarlo a tu ciudad.
