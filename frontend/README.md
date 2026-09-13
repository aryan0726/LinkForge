# LinkForge — Frontend

The React single-page application for **LinkForge**, a URL shortener and link
management platform.

> Forge smarter links. Share with confidence.

---

## Overview

This app is the user-facing interface for an existing Spring Boot + PostgreSQL
backend. It handles registration, login, short-link creation, link management
and click totals, and it talks to **real API endpoints only** — there is no mock
data, and no UI element represents a capability the backend does not provide.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router 7 |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| HTTP | Axios (single shared instance) |
| Icons | react-icons (Feather set) |
| Auth | JWT held in `localStorage` under the existing `token` key |
| Serving | nginx (SPA fallback + `/api` reverse proxy) |

---

## Getting started

### Prerequisites

- Node.js 20+ (developed against 22)
- The LinkForge backend running on `http://localhost:8080`
  (see `../linkforge-backend`)

### Install and run

```bash
cd frontend
npm install
cp .env.example .env.local   # adjust if your API lives elsewhere
npm run dev
```

The app starts on <http://localhost:5173>.

> The backend's CORS allowlist defaults to exactly `http://localhost:5173`, so
> the Vite dev server must keep that port unless you also set
> `CORS_ALLOWED_ORIGINS` on the backend. A wildcard is rejected at startup.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Produce a production bundle in `dist/` |
| `npm run preview` | Serve the built bundle locally |
| `npm run lint` | Run ESLint |
| `npm test` | Lint, unit checks, then a production build |
| `npm run test:unit` | Unit checks for `resolveShortUrl` (7 assertions) |
| `npm run test:contract` | 35 live assertions against a running backend |

---

## Environment configuration

API location is controlled by a single Vite variable (see `.env.example`):

| Variable | Default | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Must include the `/api` prefix |

Values:

- **Local dev** — `http://localhost:8080/api` (cross-origin; the backend allows it)
- **Docker / production** — `/api` (same-origin, proxied by nginx; no CORS needed)
- **Split hosting** — `https://api.example.com/api`

Only `VITE_`-prefixed variables reach the browser. Never put secrets here.

---

## Routes

| Path | Access | Description |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public only | Sign in; redirects to `/dashboard` if already authenticated |
| `/register` | Public only | Create an account; lands signed in on `/dashboard` |
| `/dashboard` | Protected | Create links, stats overview, recent links |
| `/links` | Protected | Full library with search, filter and sort |
| `/analytics` | Protected | Click totals per link |
| `/settings` | Protected | Profile, account info, security, logout |
| `*` | Public | 404 page |

Protected routes render a loader while the session is being restored, then
redirect to `/login?from=<path>` so the user returns to their original
destination after signing in.

---

## API integration

Every call goes through `src/services/`. Components never build URLs or touch
tokens directly.

| Method | Endpoint | Used for |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Account creation (returns a JWT) |
| `POST` | `/api/auth/login` | Sign in (returns a JWT) |
| `GET` | `/api/user/me` | Resolve the current profile |
| `GET` | `/api/links` | List the signed-in user's links |
| `POST` | `/api/links` | Create a short link |

### Request / response shapes

```
POST /api/auth/register  { fullName, username, email, password } -> 201 { token }
POST /api/auth/login     { email, password }                     -> 200 { token }
GET  /api/user/me                                                -> UserResponse
POST /api/links          { originalUrl }                          -> 201 LinkResponse
GET  /api/links                                                   -> 200 LinkResponse[]

LinkResponse = { originalUrl, shortCode, shortUrl, clickCount }
UserResponse = { id, fullName, username, email, role, enabled, createdAt }
```

Two behaviours worth knowing:

- **Login is by email.** The JWT subject is the email address, so the login form
  takes an email rather than a username.
- **Registration returns a token**, so a new user is signed in immediately and
  dropped straight onto the dashboard.

`shortUrl` is built by the backend from its configured `APP_BASE_URL`, so it is
authoritative and used as-is. `resolveShortUrl` in `src/services/config.js`
returns the server value whenever it is present, and only derives a URL from
`shortCode` as a fallback for a response that omits it.

This ordering matters: the host that serves the redirect is not necessarily the
host that serves the API. Deployed with `APP_BASE_URL=https://sho.rt` and an API
at `https://api.example.com/api`, the link is `https://sho.rt/abc123`.
Reconstructing it client-side from the API origin would produce
`https://api.example.com/abc123`, where nothing redirects.

### Error handling

The backend returns every failure in one shape, produced by its
`@RestControllerAdvice`:

```json
{
  "timestamp": "...",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Please correct the highlighted fields",
  "path": "/api/auth/register",
  "fieldErrors": { "email": "Email must be a valid address" }
}
```

`src/services/errors.js` normalises that — and the cases that never reach the
advice — into one object:

```js
{ status, code, message, fieldErrors }
```

Three details are worth calling out:

1. **`fieldErrors` binds directly to inputs.** The map is `{ fieldName: message }`,
   exactly the shape the forms consume, so a server-side rejection highlights the
   same field the client-side rule would have.
2. **Non-JSON and transport failures are handled.** A network failure, a timeout
   (`ECONNABORTED`), an HTML error page from a proxy, or a `null` body each map
   to human copy rather than reaching the user as
   `Request failed with status code 500`.
3. **`normalizeError` is idempotent.** Services normalise before throwing and
   pages normalise again when they catch. Without the guard in `isNormalized()`
   the second pass would see an object with no `.response` and rewrite a
   specific, actionable error into a generic "couldn't reach the API" message,
   silently discarding `fieldErrors`.

### Session expiry

A **401** on any protected request dispatches a `linkforge:session-expired`
event. `AuthContext` clears the token and redirects to `/login?expired=1`, so an
expired or invalid JWT never leaves the user on a broken page. Tokens are checked
for an `exp` claim before the app even attempts the bootstrap call.

Only 401 triggers this. The backend used to answer a missing token with 403,
which is why both codes were once treated as expiry — but 403 now genuinely means
"authenticated, but not permitted", and signing a user out for that would be
wrong, since re-authenticating would not change the outcome.

Public paths (`/auth/login`, `/auth/register`) are excluded from both the token
header and the expiry signal, because a failed login is also a 401.

### Verification

The contract is tested against a live backend rather than a mock, so backend
drift fails loudly instead of silently.

```bash
npm test                 # lint + unit checks + production build
npm run test:unit        # 7 unit assertions, no backend needed
npm run test:contract    # 35 assertions against a running backend
```

The backend's own suite is the primary safety net:

```bash
cd ../linkforge-backend
./mvnw test              # 62 integration tests, real PostgreSQL
```

`npm run test:contract` requires the Spring Boot app on `:8080` and PostgreSQL
on `:5433`. It covers validation errors and their `fieldErrors`, registration,
duplicate accounts, login, the protected profile route, link creation and
listing, cross-user isolation, the 302 redirect, click counting, anonymous
rejection, and malformed-token handling — asserting both the status code and the
response body the UI parses.

---

## Backend capabilities the UI deliberately does not expose

The interface is scoped to what the API supports. These are intentionally absent
rather than stubbed or faked:

| Not implemented | Reason |
| --- | --- |
| Delete a link | No `DELETE` endpoint exists |
| Edit / rename a link | No update endpoint exists |
| Per-link creation date | `LinkResponse` has no timestamp field |
| Clicks over time | No time-series endpoint |
| Referrers, country, device | Not recorded by the backend |
| Custom aliases | Not supported |
| QR codes | Not supported |
| Change password | No password-update endpoint |
| Delete account | No account-deletion endpoint |
| Profile editing | No profile-update endpoint |
| Custom URL validation feedback | See the validation note below |

Where a metric is unavailable, the UI says so explicitly (see the Analytics page
and the Settings security section) instead of rendering placeholder data.

### A note on validation

Validation is enforced in **both** layers, and the two are kept deliberately in
sync.

The backend is authoritative. `RegisterRequest`, `LoginRequest` and
`CreateLinkRequest` carry Bean Validation constraints, `@Valid` is applied at
every controller boundary, and URLs are checked by a custom `@ValidHttpUrl`
constraint. Anything that fails comes back as `400` with a `fieldErrors` map. The
client can always be bypassed with `curl`, so this layer is the one that actually
protects the data.

`src/utils/validation.js` mirrors those rules for fast feedback before a request
is sent:

| Field | Rule | Mirrors |
| --- | --- | --- |
| `fullName` | 2–80 characters | `@Size(min = 2, max = 80)` |
| `username` | 3–30 characters, `[a-zA-Z0-9._-]` | `@Size` + `@Pattern` |
| `email` | must look like an email, ≤ 254 characters | `@Email` + `@Size(max = 254)` |
| `password` | 8–72 characters (72 is BCrypt's effective input ceiling) | `@Size(min = 8, max = 72)` |
| link URL | absolute `http`/`https` | `@ValidHttpUrl` |

The duplication is intentional and documented in both places: the client rules
exist for responsiveness, the server rules exist for correctness. When a rule
changes, both must change — and the backend's tests fail if they diverge in a way
that matters.

---

## Project structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── auth/          AuthLayout (shared login/register shell)
│   │   ├── dashboard/     Sidebar, Topbar, layout, LinkTable, CreateLinkForm, StatsCards
│   │   ├── landing/       Navbar, Hero, HowItWorks, Features, Why, Security, CTA, Footer
│   │   ├── ui/            Button, Input, Card, Modal, Toast, CopyButton, Skeleton, …
│   │   └── ErrorBoundary.jsx
│   ├── constants/         Navigation model
│   ├── context/           AuthProvider, context objects
│   ├── hooks/             useAuth, useToast, useLinks
│   ├── pages/             Home, Login, Register, Dashboard, MyLinks, Analytics, Settings, NotFound
│   ├── routes/            ProtectedRoute, PublicOnlyRoute
│   ├── services/          apiClient, config, errors, authStorage, authService, linkService
│   ├── utils/             format, validation, clipboard
│   ├── App.jsx
│   ├── index.css          Design tokens and base styles
│   └── main.jsx
├── Dockerfile
├── nginx.conf
└── .env.example
```

### Architectural conventions

- **Services own transport.** Components import functions such as
  `linkService.createLink()`, never `axios` or a URL.
- **The token never reaches the UI.** It lives in `authStorage` and
  `apiClient`'s request interceptor. `AuthContext` exposes only the profile.
- **Styling is token-driven.** Colours, shadows and animations are defined once
  in `index.css` under `@theme` and consumed as utility classes
  (`bg-brand-600`, `shadow-lift`, `text-ink-500`).
- **Presentational components are reusable.** `LinkTable` and `CreateLinkForm`
  are shared between the Dashboard and My Links with no duplication.

---

## Docker

```bash
# Build (point the bundle at a same-origin /api proxy)
docker build -t linkforge-frontend .

# Run
docker run -p 3000:80 linkforge-frontend
```

The image is a two-stage build: Node compiles the bundle, then nginx serves it.
`nginx.conf` provides SPA fallback (so `/dashboard` survives a hard refresh),
a `/api/` reverse proxy to the `backend` service, gzip, long-lived caching for
hashed assets, and `no-store` on `index.html`.

To build against a different API host:

```bash
docker build --build-arg VITE_API_BASE_URL=https://api.example.com/api -t linkforge-frontend .
```

---

## Accessibility and UX

- Skip-to-content link, landmark elements and a visible focus ring
- Modals with focus trapping, `Escape` to close and focus restoration
- `aria-invalid` / `aria-describedby` on invalid form fields
- `aria-pressed` on filter toggles; `role="alert"` on errors
- Toast notifications announced via an `aria-live` region
- Loading skeletons that match the real layout to avoid content shift
- `prefers-reduced-motion` respected throughout
- Responsive from 320px upward, with a drawer sidebar on small screens

---

## Notes on the short URL

`shortUrl` is built by the backend from its configured `APP_BASE_URL`
(`LinkServiceImpl`), so it is correct in whatever environment the API runs in —
no client-side reconstruction is required.

`src/services/config.js` exports `resolveShortUrl()`, which returns that server
value whenever it is present and only derives a URL from `shortCode` when a
response omits `shortUrl`. It deliberately does **not** rebuild the URL from the
API origin: in the common deployment where `api.example.com` serves the API and
`sho.rt` serves the redirects, such a rebuild would point at the API host, where
nothing redirects. `verify-units.mjs` pins both branches.
