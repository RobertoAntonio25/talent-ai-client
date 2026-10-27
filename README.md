# Aplika Jobs — Frontend Client

Asistente de empleabilidad: la persona usuaria sube su CV en PDF, el backend lo extrae con IA y autocompleta el perfil, busca ofertas reales de empleo, las evalúa con match IA (`matchScore` / `matchReason` / `missingSkills[]`) y las gestiona en un panel de empleo con CV adaptado honesto + carta de presentación + email.

> **Solo frontend.** Toda la IA, la búsqueda de ofertas, la base de datos y las tareas programadas viven en el backend. Este repo **solo consume la API REST** documentada en `API.md` (fuente de verdad). Prohibido aquí: acceso directo a base de datos, SDKs de IA o de búsqueda de empleo, tareas programadas o parseo de PDF.

## Stack

| Capa                         | Tecnología                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Core                         | React 19 + TypeScript (~6, `verbatimModuleSyntax`, `noUnusedLocals/Parameters`)              |
| Bundler                      | Vite 8 + HMR (`@vitejs/plugin-react`)                                                        |
| Estilos                      | Tailwind CSS 4 (vía `@tailwindcss/vite`)                                                     |
| Router                       | React Router DOM 7 (`createBrowserRouter`)                                                   |
| Panel con arrastrar y soltar | `@dnd-kit/core` + `@dnd-kit/utilities`                                                       |
| Auth OAuth                   | `@supabase/supabase-js` (**solo** `signInWithOAuth` + `getSession`, nunca clave de servicio) |
| Iconos                       | `lucide-react`                                                                               |
| Export PDF                   | `@react-pdf/renderer` (`src/pdf/`)                                                           |
| HTTP                         | `fetch` puro en `src/services/apiClient.ts` (sin cliente externo)                            |

## Requisitos previos

- Node 20+ y npm.
- Backend en marcha (local `http://localhost:3000` o desplegado en su host). Sin `VIT_API_URL` la app **no arranca** (fallo rápido en `apiClient.ts`).
- Proyecto en la plataforma de autenticación (solo para login social con Google/LinkedIn): URL + clave pública.

## Instalación

```bash
npm install
cp .env.example .env   # rellenar valores (nunca commitear .env)
npm run dev            # http://localhost:5173
```

## Variables de entorno

`vite.config.ts` usa `envPrefix: ["VITE_", "VIT_"]`. El código lee **`VIT_*` primero, con fallback a `VITE_*`**:

| Variable                                             | Obligatoria       | Uso                                                           |
| ---------------------------------------------------- | ----------------- | ------------------------------------------------------------- |
| `VIT_API_URL` (o `VITE_API_URL`)                     | Sí                | URL base del backend. Sin ella la app lanza error al arrancar |
| `VIT_SUPABASE_URL` (o `VITE_SUPABASE_URL`)           | Solo login social | URL del proyecto de autenticación                             |
| `VIT_SUPABASE_ANON_KEY` (o `VITE_SUPABASE_ANON_KEY`) | Solo login social | Clave **pública/anon**. Nunca la clave de servicio            |

- `.env` / `.env.*` **nunca se commitean**. Solo `.env.example` documenta claves **sin valores**.
- En el host del frontend se configuran en sus variables de entorno (mismos nombres).
- Para entorno test existe `.env.test` + scripts `dev:test` (puerto 5174) / `build:test`.

## Scripts

```bash
npm run dev         # Vite + HMR (dev)
npm run dev:test    # Vite en modo test (puerto 5174)
npm run build       # tsc -b && vite build (verificación real)
npm run build:test  # build en modo test
npm run lint        # eslint . (ignora dist)
npm run preview     # previsualizar el build
```

No hay script `test`. Verificar con `lint` + `build`. Si `build` falla en tipos de `node_modules` (iconos/dnd/router): aislar con `npx tsc --skipLibCheck`. No reinstalar sin pedirlo.

## Arquitectura (`src/`)

Entrada: `src/main.tsx` → `AuthProvider` (`src/context/`) + `router` (`src/router/index.tsx`).

```text
src/
  main.tsx            # entrada
  index.css           # Tailwind
  router/             # index.tsx (definición) + RouteGuards.tsx (ProtectedRoute/PublicOnlyRoute)
  context/            # AuthContext (sesión, login/logout, updateUser)
  pages/              # Landing, Login, Register, AuthCallback, Dashboard, Settings, Profile
  layouts/            # MainLayout (nav + header + UserDropdown)
  components/
    kanban/           # panel de empleo (detalle de oferta, formulario, confirmación de borrado)
    navigation/       # UserDropdown
    profile/          # CvManager, CvBasicsForm, PersonalDataForm, PasswordForm, SkillsEditor,
                      # ExperienceEditor, EducationEditor, ProjectsEditor, LanguagesEditor, ProfileSidebar
    search/           # ManualSearchPanel
    settings/         # SearchPreferencesSection, SearchPreferencesFilters, SearchBasicsGrid,
                      # MatchThresholdSlider, CareerTransitionToggle, FieldHelp, SettingsSidebar, AgentConfigSection
    ui/               # Modal, CvViewer, CoverLetterViewer, EmptyCvState, SkeletonCard, Toggle
  services/           # fetch puro, sin JSX: apiClient, authService, aiService (legacy),
                      # jobsService, optimizer.service, profileService, userProfile.service
  hooks/              # puente a vistas: useCv, useJobs, useManualSearch, useOptimizer.hook, usePreferences
  models/             # tipos: optimizer.model, preferences.model
  types/              # cv.ts, kanban.ts
  adapters/           # cvAdapter, jobsAdapter (normalizan payloads del back)
  lib/                # supabase.ts (solo login social)
  pdf/                # documentos PDF: CvPdfDocument, CoverLetterPdfDocument, atsDoc/atsTheme/buildAtsDoc
```

Capas: `services/*.service.ts` (fetch puro) + `hooks/use*.ts` (puente a vistas) + `models/*.model.ts` (tipos) + `pages/` + `components/`.

## Rutas

| Ruta                  | Acceso                                           | Descripción                                                                                               |
| --------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `/`                   | Pública                                          | Landing                                                                                                   |
| `/login`, `/register` | Pública (`PublicOnlyRoute`)                      | Email + login social + aviso inline si se cancela en el proveedor                                         |
| `/auth/callback`      | Pública directa (**fuera** de `PublicOnlyRoute`) | Procesa `?code=` / `?error=` del login social; con token viejo el guard redirigiría antes del intercambio |
| `/dashboard`          | Privada (`ProtectedRoute`)                       | Panel de empleo + modal de CV                                                                             |
| `/settings`           | Privada                                          | Preferencias de búsqueda + búsqueda manual + agente IA (`?seccion=…&autostart=1`)                         |
| `/profile`            | Privada                                          | Datos personales, password, CV editable por bloques                                                       |

SPA: el archivo `vercel.json` reescribe todo a `/index.html`.

## Autenticación

- **Email:** `POST /api/auth/register|login` → JWT interno (`accessToken`, 1 día). Cuentas solo-social devuelven `401 OAUTH_ONLY_ACCOUNT`.
- **Login social (Google/LinkedIn):** `supabase.auth.signInWithOAuth` → `getSession()` (con reintentos) → `POST /api/auth/oauth/exchange` con el token del proveedor → JWT interno. Sin variables de autenticación el login social queda deshabilitado (`isSupabaseConfigured`, botones deshabilitados + aviso) en vez de redirigir a un dominio fantasma.
- **Sesión:** token en `localStorage` claves `"token"` + `"user"`, cabecera `Authorization: Bearer <token>`. `apiClient.ts` **no** adjunta `Bearer` en `/api/auth/*` (evita token caducado en el intercambio), salvo `changePassword` que lo envía explícito.
- **401 fuera de `/auth/`** → borra token y emite `auth:unauthorized` (logout + redirect a login). Logout limpia la sesión del proveedor + cachés personales (`aplikaCv:<uid>`, restos OAuth).
- **Password:** cambio real `POST /api/auth/change-password`; cuentas solo-social sin password usan flujo `set-password`.

## Comunicación con el backend (`apiClient.ts`)

- URL base **solo** desde variables de entorno (`VIT_API_URL || VITE_API_URL`), con fallback a la URL de producción definida en el código.
- `fetch` con `timeoutMs` por llamada; lanza `ApiError { status, code }`. El backend responde errores con envelope único `{ success:false, error, code }` (`VALIDATION_ERROR` 400, `MISSING_TOKEN` 401, `NOT_FOUND` 404, `RATE_LIMIT_EXCEEDED` 429).
- **Rate limits:** auth 10 req/15min, IA 30 req/15min → ante 429 mostrar _"inténtalo en 15 minutos"_.
- **El backend desplegado entra en reposo:** el primer arranque tarda 30-50 s. `apiClient.ts` lo traduce a `TIMEOUT`/`NETWORK_ERROR`; no es bug del front.
- **Nunca fijar `Content-Type` a mano con `FormData`** (`apiClient.ts` lo borra para que el navegador ponga el boundary).

## Funcionalidades

- **Panel de empleo:** columnas `Descubierto / Aplicado / Entrevista / Oferta / Rechazado` con arrastrar y soltar. Cada tarjeta muestra `matchScore`, `matchReason` y `missingSkills[]` (+ badge ámbar "match bajo" si score < umbral). Detalle con `JobDetailModal` (pide `GET /offers/:jobOfferId` al abrir), crear/editar con `JobFormModal`.
- **CV / Perfil:** subida PDF (≤10 MB, campo `cv`, `multipart/form-data`) con `EmptyCvState` (drag + validación) → extracción IA en backend → hidratación al fijar cuenta + edición por bloques con PATCH con debounce. Resubir CV **preserva** preferencias manuales (resuelto en backend #110).
- **Preferencias de búsqueda (`/settings`):** 13 campos (`targetRole`, `targetCity`, `employmentTypes[]`, `experienceLevel[]`, `freshness`, `radiusKm`, `country`, `workMode ANY|REMOTE|HYBRID|ONSITE`, portales, `salaryMin`, `useSkillsInQuery`, `matchThreshold`, `careerTransition`). `null`/`[]` = limpiar. Slider match 0-100 (def. 50, aviso amable <50).
- **Búsqueda manual:** `POST /api/jobs/manual-trigger` tarda **1-3 min** (búsqueda externa + IA en secuencia) → timeout cliente ≥180 s, botón deshabilitado, sin reintentos en paralelo; el front consulta el estado cada 5 s hasta DONE/ERROR y luego lee resultados.
- **Optimización IA:** `POST /api/ai/optimize` y `/cover-letter` con timeout ≥60 s la 1.ª vez por oferta, luego `cached:true` instantáneo. `useOptimizer.hook.ts` implementa GET→POST + caché `Map` en memoria + dedup en vuelo para ahorrar cuota IA. Visores `CvViewer` / `CoverLetterViewer` + export a PDF (`src/pdf/`).

## Integración backend: trampas que rompen el front

1. `jobOffer.id` es **string nativo del proveedor de ofertas (base64), no UUID** — no validarlo como UUID.
2. `POST /api/ai/cv-extractor`: `multipart/form-data`, campo `cv`, solo PDF ≤10 MB. No fijar `Content-Type`.
3. `POST /api/jobs/manual-trigger`: 1-3 min → timeout ≥180 s, botón deshabilitado, sin paralelismo.
4. `POST /api/ai/optimize|cover-letter`: timeout ≥60 s la 1.ª vez; luego `cached:true`. GET→POST + dedup para ahorrar cuota.
5. `GET /api/ai/optimize/:jobOfferId` devuelve `coverLetter` como **string JSON o null** → `JSON.parse`.
6. `PATCH .../optimize/:jobOfferId`: clave canónica `optimizedCv` (alias `adaptedCv`), parcial; si se envía `experiences` debe ir **completo**.
7. Ante 429: "inténtalo en 15 minutos" (auth 10/15min, IA 30/15min).
8. Primer arranque del backend desplegado 30-50 s → `TIMEOUT`/`NETWORK_ERROR` no es bug de front.
9. Nunca inventar ofertas ni experiencia en el CV (aviso de honestidad en UI).

## Convenciones de código

- Sufijos deseados: `.service.ts` / `.hook.ts` / `.model.ts` / `.guard.tsx`, archivos <150 líneas.
- Vistas sin fetch, services sin JSX. Props tipadas desde `*.model.ts`.
- Nombres legacy `aiService.ts` / `apiClient.ts` **no se renombran** sin `BREAKING:` + `grep` de usages.
- Commits pequeños en español. Ramas desde `dev`: `feat/…`, `fix/…` o `<issue>-descripcion`. PR contra `dev` vinculada al issue. No pushear a `main` sin pedirlo.

## Despliegue (host del frontend)

1. Importar el repo en el host.
2. Variables de entorno: `VIT_API_URL` (+ `VIT_SUPABASE_URL` / `VIT_SUPABASE_ANON_KEY` si se usa login social).
3. El rewrite SPA a `/index.html` ya está configurado en el repo.
4. Tras cambiar variables, redesplegar. Si el backend estaba en reposo, la primera petición tarda ~30-50 s.

## Troubleshooting

| Síntoma                                  | Causa probable                                    | Qué hacer                                                                    |
| ---------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| Error al arrancar: falta URL del backend | Sin `VIT_API_URL`/`VITE_API_URL`                  | Definirla en `.env` (local) o en las variables del host                      |
| Login social deshabilitado / aviso ámbar | Faltan `VIT_SUPABASE_URL`/`VIT_SUPABASE_ANON_KEY` | Rellenarlas; nunca usar la clave de servicio                                 |
| 401 tras volver del proveedor social     | Token viejo en `localStorage`                     | El callback ya lo gestiona; si persiste, limpiar `token`/`user` y reintentar |
| 429                                      | Rate limit (auth 10/15min, IA 30/15min)           | Esperar 15 minutos, no reintentar en bucle                                   |
| Búsqueda manual colgada                  | Timeout corto o doble click                       | Timeout ≥180 s, botón deshabilitado, 1 sola petición                         |
| `coverLetter` no renderiza               | Es string JSON o null                             | `JSON.parse` antes de pintar                                                 |
| Build falla en tipos de `node_modules`   | Ruido de iconos/dnd/router                        | Aislar con `npx tsc --skipLibCheck`; si es propio, corregirlo                |
| Cancelar en el proveedor social          | `?error=` del proveedor                           | Vuelve a login/register con error inline (flujo esperado)                    |

## Docs relacionadas

- `API.md` — contrato REST del backend (fuente de verdad).
- Backend: repo `Aplika-Jobs` (API + ORM + PostgreSQL + IA) → desplegado en su host.
