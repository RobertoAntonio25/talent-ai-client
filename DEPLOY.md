# Deploy & Operación (Fase 6.4)

Guía mínima para que Vercel (front) + Render (back) + Supabase funcionen sin
pantalla en blanco ni bloqueos CORS.

## 1. Variables de entorno en Vercel

En Vercel > proyecto > Settings > Environment Variables, para
Production + Preview + Development:

| Variable              | Valor                                    |
| --------------------- | ---------------------------------------- |
| `VIT_API_URL`         | `https://talent-ai-4j4j.onrender.com`    |
| `VIT_SUPABASE_URL`    | `https://<tu-proyecto>.supabase.co`      |
| `VIT_SUPABASE_ANON_KEY` | `<anon/publishable key>`               |

Notas:
- El código acepta `VIT_` o `VITE_` (`vite.config.ts` → `envPrefix`), pero
  Vercel recomienda no usar prefijo `VITE_` por exposición pública: mantenemos `VIT_`.
- El `.env` local NO se sube a git. Sin estas 3 vars, `supabase.ts` usa
  placeholder (no crashea) pero OAuth queda deshabilitado.
- Tras cambiar vars: Deployments > Redeploy > Clear cache.

## 2. SPA routing (`vercel.json`)

`vercel.json` contiene:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Sin esto, entrar directo a `/dashboard` o pulsar F5 da 404 porque
`createBrowserRouter` es client-side.

## 3. Backend en Render (cold start)

El plan gratuito duerme el servicio tras ~15 min sin tráfico. La primera
petición tarda 30-50 s (despierta contenedor + Prisma + SDKs).

Rutina antes de probar/demostrar:
1. Abrir `https://talent-ai-4j4j.onrender.com/api/health` en pestaña aparte.
2. Si tarda y luego devuelve `{"status":"success"...}` → ya despertó.
3. Recién entonces probar login / dashboard / manual-trigger.

Keep-alive barato: programar en `cron-job.org` o UptimeRobot un GET cada
10 min a `/api/health`.

## 4. CORS y previews

El back permite `http://localhost:5173`, `https://aplika-jobs.vercel.app` y
cualquier `*.vercel.app` (previews). Cada preview tiene URL distinta; no hace
falta darlas de alta una por una. En producción real, restringir el regex a
tu proyecto.

Tras cambiar `server.ts` (CORS): esperar a que Render marque `Live` (2-3 min).
Sin redeploy, el fix no existe en prod.

## 5. OAuth Supabase

En Supabase Dashboard > Auth > Providers: habilitar Google + LinkedIn OIDC.
Redirect URLs permitidas:
- `http://localhost:5173/auth/callback`
- `https://aplika-jobs.vercel.app/auth/callback`

El callback canjea `session.access_token` por JWT interno en
`POST /api/auth/oauth/exchange` (mismo shape que login clásico).

## 6. Rate limits a respetar en demo

- `POST /api/auth/*`: 10 req / 15 min → el front muestra “inténtalo en 15 min”.
- `POST /api/ai/*`: 30 req / 15 min.
- `POST /api/jobs/manual-trigger`: 1-3 min primera vez, timeout cliente 180 s,
  no clicar en paralelo (el botón se deshabilita).
