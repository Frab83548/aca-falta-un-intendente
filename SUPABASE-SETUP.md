# Setup con Supabase — paso a paso

Guía completa para levantar el backend en ~15 minutos.

## 1. Crear proyecto en Supabase

1. Andá a https://app.supabase.com y hacé login (con GitHub es lo más rápido).
2. Tocá **"New project"**.
3. Elegí un nombre, una contraseña fuerte para la DB, y la región **South America (São Paulo)** — es la más cerca de Argentina.
4. Esperá ~2 minutos mientras se provisiona el proyecto.

## 2. Ejecutar el schema SQL

1. En el panel izquierdo, tocá **SQL Editor**.
2. Tocá **"New query"**.
3. Copiá todo el contenido de `supabase-schema.sql` y pegalo.
4. Tocá **"Run"** (o Ctrl/Cmd + Enter).
5. Deberías ver "Success. No rows returned" — las tablas ya están creadas.

Qué hizo ese script:
- Creó las tablas `reclamos`, `votos`, `comentarios`
- Creó una vista `reclamos_con_votos` que ya te trae el conteo incluido
- Activó Row Level Security con policies seguras
- Creó el bucket `reclamos-fotos` para storage
- Habilitó realtime

## 3. Habilitar auth anónima

1. En el panel izquierdo, andá a **Authentication → Providers**.
2. Buscá **"Anonymous"** en la lista.
3. Activá el toggle y guardá.

Esto permite que los vecinos usen la app sin registrarse. Cada navegador recibe un `user_id` único que se guarda localmente.

## 4. Copiar la config al proyecto

1. En Supabase, andá a **Project Settings → API**.
2. Copiá:
   - **Project URL** (ej: `https://abcdefgh.supabase.co`)
   - **anon public key** (empieza con `eyJhb...`)
3. Abrí `supabase-config.js` y pegá los valores:

```javascript
export const supabaseConfig = {
  url: "https://pbjyyxxvxowktuaytbkh.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBianl5eHh2eG93a3R1YXl0YmtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzQzNTksImV4cCI6MjA5MjExMDM1OX0.ZoS92VSLHgfDR3piFaHrDwa2C-WGEW-AK-Wn4oDdaq8"
};
```

> ⚠️ La `anon public` key es **pública** y puede estar en el frontend. Lo que NO hay que poner nunca es la `service_role` key — esa sí es secreta.

## 5. Activar Supabase en index.html

Por defecto ya está activo, pero asegurate que en `index.html` se esté cargando:

```html
<script type="module" src="storage-supabase.js"></script>
```

Y que las otras opciones (`storage-local.js` y `storage-firebase.js`) estén comentadas.

## 6. Probarlo en local

Abrí una terminal en la carpeta del proyecto y corré:

```bash
python3 -m http.server 8000
```

Andá a http://localhost:8000 y cargá un reclamo de prueba.

Para verificar que se guardó en la base:
1. En Supabase → **Table Editor** → `reclamos` → ahí debería aparecer tu reclamo.
2. En **Table Editor → votos**, si tocás "Me pasa lo mismo", debería aparecer una fila.

## 7. Desplegar a producción

Igual que antes: arrastrá la carpeta a Netlify Drop (https://app.netlify.com/drop) o usá Vercel/GitHub Pages.

⚠️ **Importante sobre CORS**: Supabase permite cualquier origen por defecto para la `anon` key, así que no hace falta configurar nada.

---

## 📊 Estructura de datos (qué queda guardado dónde)

### Tabla `reclamos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único autogenerado |
| `titulo` | text | Título del reclamo (1–80 chars) |
| `descripcion` | text | Descripción opcional (0–400 chars) |
| `categoria` | enum | bache, basura, luz, agua, etc. |
| `lat`, `lng` | float8 | Coordenadas |
| `barrio` | text | Barrio opcional |
| `foto_url` | text | URL pública de la foto |
| `estado` | enum | pendiente, en_proceso, resuelto, descartado |
| `autor_id` | uuid | FK a `auth.users` |
| `created_at` | timestamptz | Cuando se creó |
| `updated_at` | timestamptz | Cuando se modificó |
| `ubicacion` | geography | Punto PostGIS (auto-calculado) |

### Tabla `votos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID del voto |
| `reclamo_id` | uuid | FK al reclamo |
| `usuario_id` | uuid | FK a `auth.users` |
| `created_at` | timestamptz | Cuando votó |

Tiene un UNIQUE constraint `(reclamo_id, usuario_id)` así cada usuario solo puede votar una vez por reclamo.

### Tabla `comentarios` (para más adelante)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID |
| `reclamo_id` | uuid | FK al reclamo |
| `autor_id` | uuid | FK a `auth.users` |
| `texto` | text | 1–500 chars |
| `created_at` | timestamptz | Cuando lo escribió |

### Bucket de Storage `reclamos-fotos`

Las fotos se guardan en paths tipo: `{user_id}/{timestamp}.jpg`. Solo el dueño puede borrar las suyas, todos pueden ver las demás.

---

## 🔒 Seguridad: cómo funcionan las RLS policies

El frontend usa la `anon` key que es pública. La seguridad real la da Row Level Security (definida en SQL). Las reglas actuales dicen:

**reclamos**:
- ✅ Cualquiera (hasta sin login) puede leer.
- ✅ Solo usuarios autenticados (aunque sean anónimos) pueden crear — y el `autor_id` tiene que ser su propio ID.
- ✅ Solo el autor puede modificar su reclamo.
- ❌ Nadie puede borrar (a propósito — si quieras permitirlo, descomentá la policy correspondiente).

**votos**:
- ✅ Cualquiera puede leer.
- ✅ Solo autenticados pueden votar, y solo a nombre propio.
- ✅ Un usuario puede retirar su propio voto.
- ✅ UNIQUE constraint impide votar dos veces el mismo reclamo.

**storage `reclamos-fotos`**:
- ✅ Todos pueden ver las fotos.
- ✅ Solo autenticados pueden subir, y solo en su propia carpeta (`{user_id}/...`).
- ✅ Solo pueden borrar sus propias fotos.

---

## 🚀 Escalabilidad

Tier gratis de Supabase te da:

- 500 MB de base de datos (~ 1 millón de reclamos de texto, sin contar fotos)
- 1 GB de storage para fotos (~ 5.000 fotos de buena calidad, o 20.000 comprimidas)
- 2 GB de transferencia mensual
- 50.000 MAU (monthly active users)

Para una ciudad de ~70.000 habitantes (San Pedro de Jujuy tiene ~65.000) con 10% de uso activo mensual, estarías dentro del tier gratis sin problemas.

**Si crece más de eso**, el plan Pro son USD 25/mes y te da 8GB DB, 100GB storage, 250GB transferencia — es más que suficiente para varias ciudades.

---

## 🛠️ Queries útiles para administrar

### Ver los 10 reclamos más votados
```sql
select titulo, categoria, barrio, votos_count
from reclamos_con_votos
order by votos_count desc
limit 10;
```

### Reclamos por categoría
```sql
select categoria, count(*) as total
from reclamos
group by categoria
order by total desc;
```

### Reclamos a menos de 500m de un punto (necesita PostGIS)
```sql
select *
from reclamos
where st_dwithin(
  ubicacion,
  st_makepoint(-64.8660, -24.2297)::geography,
  500
);
```

### Marcar un reclamo como resuelto (si fueras admin)
```sql
update reclamos set estado = 'resuelto' where id = 'xxx';
```

---

## ❓ Problemas comunes

**"Anonymous sign-ins are disabled"**
→ No activaste el provider Anonymous (paso 3).

**Los reclamos aparecen pero no puedo votar**
→ Probablemente no ejecutaste las RLS policies, o Auth anónima no está habilitada.

**"new row violates row-level security policy"**
→ Alguna policy está mal. Revisá que el schema se ejecutó completo.

**La foto no se sube**
→ Revisá que el bucket `reclamos-fotos` existe (Storage en el menú lateral). Si no, ejecutá solo la parte del schema que crea el bucket.

**No aparecen cambios en tiempo real**
→ En Supabase → Database → Replication, verificá que la publicación `supabase_realtime` incluye las tablas `reclamos` y `votos`.
