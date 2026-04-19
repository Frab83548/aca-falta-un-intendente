# Deploy en Vercel — paso a paso

Vercel tiene un tier gratis muy generoso para proyectos estáticos como este:
- **Ancho de banda**: 100 GB/mes
- **Sitios ilimitados**
- **HTTPS y dominio `.vercel.app` gratis**
- **Deploy automático** al pushear a GitHub

## Hay dos caminos: con Git (recomendado) o por CLI

---

## 🟢 Camino A: deploy con GitHub (lo mejor)

Con este camino, cada vez que hagas un `git push` se redeploya solo. Es lo más profesional.

### 1. Crear el repo en GitHub

1. Andá a https://github.com/new
2. Nombre: `aca-falta-un-intendente` (o lo que quieras)
3. Visibilidad: **Private** (recomendado) o Public — es igual, la app funciona igual.
4. NO marques "Add README" ni "Add .gitignore" (ya los tenemos).
5. Creá el repo.

### 2. Subir el código desde tu máquina

En la carpeta del proyecto, abrí terminal y corré:

```bash
git init
git add .
git commit -m "Primer commit - Acá falta un intendente San Pedro"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/aca-falta-un-intendente.git
git push -u origin main
```

⚠️ El `.gitignore` ya está configurado para NO subir `supabase-config.js` ni `firebase-config.js`. Así no filtrás tus credenciales si el repo es público.

### 3. Conectar Vercel a GitHub

1. Andá a https://vercel.com/signup
2. Registrate con tu cuenta de GitHub (es lo más rápido).
3. Una vez adentro, tocá **"Add New..."** → **"Project"**.
4. Vercel te muestra tus repos de GitHub — elegí `aca-falta-un-intendente`.
5. En la pantalla de configuración:
   - **Framework Preset**: "Other" (Vercel lo detecta solo como sitio estático).
   - **Build Command**: dejá vacío (no hace falta build).
   - **Output Directory**: dejá vacío (o ponelo en `.`).
   - **Install Command**: dejá vacío.

### 4. Configurar variables de entorno ⚠️ IMPORTANTE

Como `supabase-config.js` NO se subió al repo (está en .gitignore), Vercel no va a tenerlo. Hay dos opciones:

#### Opción 4A: Subir el config temporalmente (más rápido para probar)

Si te urge probarlo, podés commitear `supabase-config.js` temporalmente. La anon key ES pública, así que técnicamente no hay problema — pero esa key queda para siempre en el historial de git.

Para hacerlo:
```bash
git rm --cached .gitignore    # (no hace falta)
# editá .gitignore y borrá las líneas de supabase-config.js
git add supabase-config.js .gitignore
git commit -m "Agregar config Supabase"
git push
```

#### Opción 4B: Usar variables de entorno (lo correcto)

En Vercel, durante el setup (o después, en Settings → Environment Variables), agregá:

- `VITE_SUPABASE_URL` = `https://tu-proyecto.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGci...`

**PERO**: Vercel no inyecta env vars en HTML/JS estático automáticamente. Necesitás un pequeño build step. La alternativa más simple es generar `supabase-config.js` durante el deploy con un script.

Creá un archivo llamado `build.sh` en la raíz:

```bash
#!/bin/bash
cat > supabase-config.js <<EOF
export const supabaseConfig = {
  url: "${VITE_SUPABASE_URL}",
  anonKey: "${VITE_SUPABASE_ANON_KEY}"
};
EOF
```

Y en `vercel.json` agregá:

```json
{
  "buildCommand": "bash build.sh",
  ...
}
```

> Si esto te parece mucho lío, andá a la opción 4A — la anon key es pública de todas formas, el único "problema" es que queda en el historial de git.

### 5. Deploy

Tocá **"Deploy"**. En 10-30 segundos tenés la URL: `https://aca-falta-un-intendente.vercel.app` (o el nombre que le hayas puesto).

### 6. Agregar la URL de Vercel a Supabase

Para evitar problemas de CORS:

1. En Supabase, andá a **Authentication → URL Configuration**.
2. En **Site URL** poné tu URL de Vercel: `https://aca-falta-un-intendente.vercel.app`
3. En **Redirect URLs** agregá también esa URL.

---

## 🟡 Camino B: deploy sin Git (Vercel CLI)

Si no querés usar Git todavía, podés hacer deploy directo:

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Desde la carpeta del proyecto, ejecutar:

```bash
cd aca-falta-un-intendente
vercel login      # te pide el email, sigue las instrucciones
vercel            # deploy de preview
vercel --prod     # deploy a producción
```

La CLI te va a preguntar:
- **Set up and deploy?** → Y
- **Which scope?** → tu cuenta
- **Link to existing project?** → N
- **Project name?** → dejá el default o elegí uno
- **In which directory is your code located?** → `./`
- **Want to modify these settings?** → N

En 10 segundos tenés la URL lista.

---

## 🔴 Camino C: deploy por drag & drop (lo más simple)

Si no querés ni Git ni CLI:

1. Andá a https://vercel.com/new
2. Tocá **"Browse all templates"** → bajá y tocá **"Deploy without a git repository"**.
3. O directamente arrastrá la carpeta a la zona de drop.

(Este método es el menos usado porque no tiene redeploy automático, pero funciona.)

---

## ⚙️ Dominio personalizado (opcional, gratis)

Si tenés un dominio (aunque sea uno barato de Nic.ar):

1. En Vercel, andá a tu proyecto → **Settings → Domains**.
2. Agregá tu dominio (ej: `acafaltaunintendente.com.ar`).
3. Vercel te da los DNS records que tenés que configurar en tu registrador.
4. Esperás ~10 minutos y listo.

---

## 🔁 Redeploys automáticos

Si usaste el camino A (GitHub), cada vez que hagas `git push` se redeploya. Si querés forzar un redeploy sin cambios:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

O desde el dashboard de Vercel → tu proyecto → **Deployments** → tocá los 3 puntos → **Redeploy**.

---

## 🆘 Problemas comunes

### "Module not found: supabase-config.js"
→ El archivo no se subió al repo (está en .gitignore). Mirá el paso 4 arriba.

### "Invalid API key" al entrar al sitio
→ La config quedó sin llenar. Verificá que `supabase-config.js` tenga los valores reales.

### Errores de CORS con Supabase
→ Agregá la URL de Vercel al campo "Site URL" en Authentication → URL Configuration.

### La página carga pero el mapa está blanco
→ Abrí F12 → Console. Si ves un error de tiles, puede ser el adblocker. Si ves un error de Supabase, mirá las credenciales.

### "404 NOT_FOUND" al cargar /algo
→ Es un sitio estático single page, no hay rutas. Asegurate de entrar al root `/` o agregá rewrites en `vercel.json`.

---

## 💰 Costos

- **Vercel Hobby (gratis)**: 100 GB/mes de ancho de banda, builds ilimitados.
- **Supabase Free**: 500 MB DB, 1 GB storage, 50k MAU.

Para una ciudad chica como San Pedro (~65k habitantes), estás MUY por debajo del límite gratuito incluso si el 100% usara la app todos los días.

Si algún día llegás a los límites, Vercel Pro son USD 20/mes y Supabase Pro USD 25/mes.
