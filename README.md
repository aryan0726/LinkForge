<div align="center">

# LinkForge

**Forge smarter links. Share with confidence.**

A URL shortener and link management platform built with React, Spring Boot and PostgreSQL.

[Features](#features) · [Architecture](#architecture) · [Getting started](#getting-started) · [API](#api-reference) · [Deployment](#deployment) · [Limitations](#known-limitations)

</div>

---

## What is LinkForge?

LinkForge turns long, unwieldy URLs into clean short links, keeps them organised
in a personal library, and counts how many times each one is opened.

It is a complete full-stack application: a React single-page app talking to a
stateless Spring Boot REST API backed by PostgreSQL, with JWT authentication
throughout.

---

## Features

**Accounts**
- Register with full name, username, email and password
- Passwords hashed with BCrypt, never returned to the client
- Stateless JWT authentication (24-hour expiry)
- Protected routes that redirect unauthenticated visitors to login and return
  them to their original destination afterwards
- Graceful session-expiry handling that distinguishes "sign in again" (401) from
  "you may not do this" (403)
- Per-field server-side validation errors surfaced directly on the offending
  inputs

**Links**
- Shorten any `http`/`https` URL to a unique six-character code
- URLs validated server-side; anything that is not an absolute `http`/`https`
  URL is rejected with a `400` and an explanation
- View all links belonging to your account — and only yours
- Copy any short link to the clipboard with inline confirmation
- Open a link's destination in a new tab
- Search by short code, domain or destination URL
- Filter by whether a link has been clicked
- Sort by clicks, destination or short code

**Insights**
- Total links, total clicks and average clicks per link
- Per-link click ranking with share-of-total percentages
- Top-performing link highlighting

**Interface**
- Responsive from 320px upward, with a drawer sidebar on mobile
- Loading skeletons matched to real layout dimensions
- Toast notifications, empty states and error states
- Accessible forms, focus management and keyboard navigation
- Confirmation dialogs before destructive actions
- Respects `prefers-reduced-motion`

---

## Architecture

```
┌───────────────────────┐        ┌──────────────────────┐        ┌──────────────┐
│   React SPA (Vite)    │  HTTP  │  Spring Boot REST    │  JDBC  │  PostgreSQL  │
│   Tailwind CSS v4     │ ─────► │  Spring Security     │ ─────► │              │
│   React Router 7      │  JSON  │  JWT filter chain    │        │              │
│   Served by nginx     │        │  Port 8080           │        │  Port 5433   │
└───────────────────────┘        └──────────────────────┘        └──────────────┘
        Bearer <token>                     │
                                           ▼
                                  POST /api/auth/**   (public)
                                  POST /api/links     (auth)
                                  GET  /api/links     (auth)
                                  GET  /{shortCode}   (public redirect)
```

### Repository layout

```
LinkForge/
├── frontend/            React SPA (see frontend/README.md)
│   ├── src/
│   │   ├── components/  UI, landing, dashboard and auth components
│   │   ├── services/    API client, error normalisation, token storage
│   │   ├── hooks/       useAuth, useLinks, useToast
│   │   ├── pages/       Route components
│   │   └── routes/      Protected/public route guards
│   ├── Dockerfile       Two-stage build → nginx
│   └── nginx.conf       SPA fallback + /api reverse proxy
└── linkforge-backend/   Spring Boot service
    └── src/main/
        ├── java/com/linkforge/
        │   ├── config/       Security, CORS, JPA auditing
        │   ├── controller/   Auth, Link, User, Redirect
        │   ├── service/      Business logic
        │   ├── repository/   Spring Data JPA
        │   ├── entity/       User, Link, Role, BaseEntity
        │   ├── dto/          Request/response types
        │   ├── exception/    Typed exceptions + global handler
        │   ├── security/     JWT filter, token service, 401 entry point
        │   ├── validation/   Custom URL constraint
        │   └── util/         Short-code generator
        └── resources/
            ├── application.yaml      Base configuration
            ├── application-dev.yaml  Local development profile
            └── db/migration/         Flyway migrations
```

### Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS v4, Axios |
| Backend | Spring Boot 3.5, Spring Security, Spring Data JPA, Bean Validation, Java 21 |
| Database | PostgreSQL 16, Flyway migrations |
| Auth | JWT (jjwt 0.12), BCrypt |
| Build & deploy | Docker, nginx, GitHub, Jenkins, AWS EC2 |

### Security model

| Concern | Approach |
| --- | --- |
| Passwords | BCrypt hashing; never returned by any endpoint |
| Tokens | HS256 JWT, 24 h expiry, subject = email |
| Token validation | Expired, malformed, wrongly-signed and unsupported tokens all yield `401`, never `500` |
| Session | Stateless — no cookie, no server-side session |
| CSRF | Disabled, which is safe *because* there is no cookie: a browser cannot be tricked into attaching another site's `Authorization` header |
| Authorization | Every query is scoped to the authenticated user; no endpoint accepts a user id |
| Resource probing | Another user's resource returns `404`, not `403`, so existence cannot be tested |
| Credential enumeration | Login answers identically for an unknown email and a wrong password |
| Secrets | Read from the environment; `JWT_SECRET` has no default and the app refuses to start without it |
| Error output | Centralised handler; stack traces, SQL and internal class names are logged, never returned |
| CORS | Explicit origin allowlist; `*` is rejected at startup |
| Request validation | Enforced server-side with Bean Validation — the frontend rules are for feedback, not security |

---

## Getting started

### Prerequisites

- Java 21+
- Node.js 20+
- PostgreSQL 16+
- Docker (optional, for containerised runs)

### 1. Database

The backend expects a PostgreSQL database on port `5433` (not the default
`5432`). The quickest way to get one:

```bash
docker run -d --name linkforge-pg \
  -e POSTGRES_DB=linkforge \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 \
  postgres:16-alpine
```

Or, with a local PostgreSQL install:

```sql
CREATE DATABASE linkforge;
```

**You do not need to create any tables.** The schema is owned by Flyway and is
built automatically on first boot from
`src/main/resources/db/migration/V1__baseline_schema.sql`. Nothing about the
schema lives in Java; `spring.jpa.hibernate.ddl-auto` is set to `validate`, so
Hibernate only *checks* the tables and refuses to start if they disagree with
the entities. If migrations and entities ever drift, the application fails fast
at startup instead of silently reshaping the database.

The same migration set is applied to an existing database without data loss: the
baseline is idempotent (`IF NOT EXISTS`) and no migration in this repository
contains a `DROP`.

### 2. Environment variables

Configuration is read from the environment. Copy the template and fill it in:

```bash
cd linkforge-backend
cp .env.example .env
```

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `JWT_SECRET` | **Yes** | — | HS256 signing key, at least 32 bytes. The app refuses to start without it. |
| `DB_URL` | No | `jdbc:postgresql://localhost:5433/linkforge` | JDBC connection string |
| `DB_USERNAME` | No | `postgres` | Database user |
| `DB_PASSWORD` | No | `postgres` | Database password |
| `APP_BASE_URL` | No | `http://localhost:8080` | Origin used to build returned short URLs |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed browser origins |
| `SERVER_PORT` | No | `8080` | HTTP port |
| `JWT_EXPIRATION_MS` | No | `86400000` | Token lifetime (24 h) |
| `DB_POOL_SIZE` / `DB_POOL_MIN_IDLE` | No | `10` / `2` | Hikari pool sizing |
| `LOG_LEVEL_APP` / `LOG_LEVEL_SECURITY` / `LOG_LEVEL_SQL` | No | `INFO` / `INFO` / `WARN` | Log levels |

Generate a secret with:

```bash
openssl rand -base64 48
```

Two of these have deliberate guard rails:

- **`JWT_SECRET` has no default in `application.yaml`.** The application will not
  start if it is missing, so a deployment cannot accidentally run with a
  committed secret. The `dev` profile does provide a *public, clearly-labelled*
  development-only default so a fresh clone runs with no setup — see
  `application-dev.yaml`, and never reuse that value.
- **`CORS_ALLOWED_ORIGINS` rejects `*`.** The API is called with credentials, and
  a wildcard origin would let any website read authenticated responses. Naming
  origins explicitly is enforced at startup, not merely recommended.

`.env` is gitignored; `.env.example` is the committed template. Never commit a
real secret.

### 3. Backend

```bash
cd linkforge-backend

# Load .env (bash / zsh)
set -a && source .env && set +a

./mvnw spring-boot:run
```

The API starts on <http://localhost:8080>. A quick check that it is up and that
security is wired correctly:

```bash
curl -i http://localhost:8080/api/links   # expect 401 — this route needs a JWT
```

A `401` with a JSON body is the correct answer. It means the request reached the
security filter chain and was rejected cleanly, which is what you want to see.

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The app starts on <http://localhost:5173>.

> The backend's CORS policy allows exactly `http://localhost:5173` by default,
> which is Vite's dev port. If you change the port, set `CORS_ALLOWED_ORIGINS`
> to match.

### Verify it works

**Backend tests** — 59 integration tests against a real PostgreSQL database:

```bash
cd linkforge-backend
createdb linkforge_test          # or: CREATE DATABASE linkforge_test;
./mvnw test
```

The suite runs against a real database rather than an in-memory substitute, so
the Flyway migrations and the `validate` check are genuinely exercised. It
creates and drops its own schema; point `TEST_DB_*` at a throwaway database if
you prefer not to use `linkforge_test`.

**Frontend checks**:

```bash
cd frontend
npm test              # lint + production build
npm run test:contract # 33 live assertions against a running backend
```

`npm run test:contract` needs the backend running. It exercises the real API and
asserts that the responses match what the frontend expects, so a backend change
that breaks the UI fails there instead of in a browser.

**Manual walkthrough:**

1. Open <http://localhost:5173> — the landing page should load.
2. Go to `/register` and create an account. You are signed in immediately.
3. Paste any URL into the create-link form and click **Shorten**.
4. Copy the resulting short link and open it — it should redirect.
5. Refresh the dashboard — the link persists with its click count.
6. Log out, then try to visit `/dashboard` directly — you should be redirected
   to login.

---

## API reference

Base URL: `http://localhost:8080`

| Method | Endpoint | Auth | Body | Success | Response |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | — | `{ fullName, username, email, password }` | `201` | `{ token }` |
| `POST` | `/api/auth/login` | — | `{ email, password }` | `200` | `{ token }` |
| `GET` | `/api/user/me` | Bearer | — | `200` | `UserResponse` |
| `POST` | `/api/links` | Bearer | `{ originalUrl }` | `201` | `LinkResponse` |
| `GET` | `/api/links` | Bearer | — | `200` | `LinkResponse[]` |
| `GET` | `/api/links/{shortCode}` | Bearer | — | `302` | redirect |
| `GET` | `/{shortCode}` | — | — | `302` | redirect |

Protected endpoints expect `Authorization: Bearer <token>`.

**LinkResponse**

```json
{
  "originalUrl": "https://example.com/a/very/long/path",
  "shortCode": "lf8aQz",
  "shortUrl": "https://linkforge.example.com/lf8aQz",
  "clickCount": 12
}
```

`shortUrl` is built from `APP_BASE_URL`, so it is correct in whatever
environment the application is deployed to.

**UserResponse**

```json
{
  "id": "421a9c6f-bd77-4294-886f-d605b7a9e502",
  "fullName": "Ada Lovelace",
  "username": "ada",
  "email": "ada@example.com",
  "role": "USER",
  "enabled": true,
  "createdAt": "2026-09-13T17:45:40.028952"
}
```

This is a dedicated response type, not the database entity. The password hash is
never part of the payload.

### Authentication flow

1. `POST /api/auth/register` creates the account and returns a token
   immediately, so registration signs the user in without a second call.
2. `POST /api/auth/login` verifies credentials and returns a token.
3. The client stores the token and sends it as `Authorization: Bearer <token>`
   on every protected request.
4. A request with no token, or with a token that is expired, tampered with or
   malformed, is answered **401** with a JSON body.
5. `GET /api/user/me` returns the authenticated user's own profile. There is no
   endpoint for fetching another user, and no user parameter to tamper with —
   the identity always comes from the token.

Tokens are HS256 JWTs whose subject is the user's **email**, valid for 24 hours
by default.

### Error responses

Every failing request returns the same shape:

```json
{
  "timestamp": "2026-09-13T12:15:57.303Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Please correct the highlighted fields",
  "path": "/api/auth/register",
  "fieldErrors": {
    "email": "Email must be a valid address"
  }
}
```

`fieldErrors` is present only for validation failures, and the frontend binds it
directly to form inputs.

| Status | `error` | Meaning |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | Body failed validation, or could not be parsed |
| `400` | `INVALID_URL` | Not an absolute `http`/`https` URL |
| `401` | `UNAUTHORIZED` | Missing, expired, malformed or wrong credentials |
| `403` | `FORBIDDEN` | Authenticated, but not permitted |
| `404` | `NOT_FOUND` | No such resource |
| `405` | `VALIDATION_ERROR` | Method not supported for this path |
| `409` | `CONFLICT` | Duplicate email or username |
| `500` | `INTERNAL_ERROR` | Unexpected failure; details are logged, never returned |

**401 vs 403.** These are genuinely different and the distinction is load-bearing:

- **401** means *not authenticated* — no token, or a token that cannot be
  trusted. The client should sign in again.
- **403** means *authenticated but not allowed*. Signing in again would not
  help.

Conflating them would make the UI sign a user out for a permission error they
cannot fix by re-authenticating, so the API never returns 403 for a missing token.

### How short URLs work

1. `POST /api/links` validates the URL and generates a six-character code from a
   cryptographically secure random source (62 symbols → roughly 5.7 × 10¹⁰
   possibilities).
2. The link row is inserted with a `UNIQUE` constraint on `short_code`. That
   constraint — not the pre-insert check — is the actual uniqueness guarantee.
3. `GET /{shortCode}` looks the code up, increments the click counter with a
   single atomic `UPDATE ... SET click_count = click_count + 1`, and returns a
   `302` to the stored destination.

The increment is deliberately a database-side operation rather than
read-modify-write in Java. Reading the counter, adding one, and saving it back
loses increments when two visits arrive at once, because both read the same
starting value and the second write overwrites the first. Doing the arithmetic
inside the `UPDATE` makes the database serialise concurrent requests, so every
visit counts. `RedirectApiTest` fires 25 simultaneous requests at one link and
asserts the count lands on exactly 25.

### Analytics limitations

The backend records **only a total click count per link**. It does not store
timestamps, referrers, user agents, IP addresses or geography, so none of those
can be reported. The Analytics page shows a click ranking plus an explicit list
of what is not tracked, rather than presenting fabricated data.

Adding real analytics would mean a new table recording one row per visit — a
schema change, not a UI change.

### Notes on authorization

Every link endpoint is scoped to the authenticated user, and the scoping is
enforced **in the database query**, not by a check performed after loading a row:

```java
List<Link> findByUserOrderByIdDesc(User user);
```

No endpoint accepts a user identifier. Ownership is derived from the
`SecurityContext`, which is populated from the verified token, so there is no
request parameter a client could change to reach another account's data. A
lookup for a resource belonging to somebody else returns **404**, not 403, so the
API cannot be used to probe whether a given short code or id exists.

---

## Deployment

### Backend

The backend is a standard Spring Boot application. Build a runnable jar and run
it with the environment configured:

```bash
cd linkforge-backend
./mvnw clean package

JWT_SECRET="$(openssl rand -base64 48)" \
DB_URL="jdbc:postgresql://db-host:5432/linkforge" \
DB_USERNAME="linkforge" \
DB_PASSWORD="..." \
APP_BASE_URL="https://linkforge.example.com" \
CORS_ALLOWED_ORIGINS="https://linkforge.example.com" \
java -jar target/linkforge-backend-0.0.1-SNAPSHOT.jar
```

There is no backend Dockerfile in this repository. Producing one is a small
piece of work — a `maven:3.9-eclipse-temurin-21` build stage and an
`eclipse-temurin:21-jre` runtime stage — but it is deliberately not included
rather than shipped untested.

Three configuration points matter in production:

- **`JWT_SECRET`** must be a real secret from your platform's secret store. The
  application will not start without it.
- **`APP_BASE_URL`** must be the publicly reachable origin, or every short link
  the API returns will point somewhere wrong.
- **`CORS_ALLOWED_ORIGINS`** should list your actual frontend origin(s). If the
  frontend is served from the same origin as the API (the recommended setup),
  CORS is not involved at all and this setting is irrelevant.

### Frontend

```bash
cd frontend
docker build --build-arg VITE_API_BASE_URL=/api -t linkforge-frontend .
docker run -p 3000:80 linkforge-frontend
```

The image is verified working. Running the container against a backend on the
host (rather than in Compose) needs an alias for the proxy target:

```bash
docker run -d --name linkforge-web \
  --add-host backend:host-gateway \
  -p 8090:80 linkforge-frontend
```

Confirmed in the running container:

| Check | Result |
| --- | --- |
| SPA deep routes (`/dashboard`, `/links`, `/settings`, unknown paths) | all `200` (fallback works — no 404 on hard refresh) |
| API reverse proxy (`/api/*`) | reaches Spring Boot; returns its JSON, not nginx HTML |
| Register → login → `GET /api/user/me` through the proxy | `200` with a valid JWT |
| gzip on the JS bundle | 406,744 → 121,803 bytes (**70% smaller**) |
| Hashed assets | `Cache-Control: max-age=31536000, immutable` |
| `index.html` | `no-cache, no-store, must-revalidate` |
| Container healthcheck | `healthy` |

nginx listens on **both** IPv4 and IPv6 (`listen 80;` plus
`listen [::]:80 ipv6only=on;`). A bare `listen 80;` binds IPv4 only, which makes
the container healthcheck fail because `localhost` resolves to `::1` first
inside the container.

### Same-origin recommendation

Because nginx proxies `/api` to the backend, the SPA and the API are same-origin
in this deployment — so CORS is not exercised at all and no preflight requests
are made. This is the simpler and recommended production topology; the CORS
allowlist exists for the case where the API is served from a separate origin
(such as the Vite dev server on `:5173`).

### CI/CD

The intended pipeline is GitHub → Jenkins → AWS EC2:

1. Push to `main` triggers a Jenkins build via webhook.
2. Jenkins runs `./mvnw test` for the backend and `npm ci && npm test` for the
   frontend.
3. Docker images are built and pushed to a registry.
4. EC2 pulls the images and restarts the containers.

Because `npm test` includes a production build and `./mvnw test` includes the
Flyway-plus-`validate` startup check, a schema or contract drift fails the
pipeline rather than reaching production.

---

## Known limitations

These are deliberate and documented rather than worked around.

**Product limitations**

- **No link deletion** — the API exposes no `DELETE` endpoint, so there is no
  delete control in the UI. Links can be deactivated in the database
  (`links.active`), which makes them stop redirecting.
- **No custom aliases** — the short code is always generated, never chosen.
- **No QR codes, password change, profile editing or account deletion** — none
  of these endpoints exist.
- **No per-link creation date** — `links` has no `created_at` column, so the
  table shows no "Created" column and the link list is not chronologically
  ordered. The frontend prepends a newly created link so it appears immediately
  where the user expects it.
- **Click totals only** — see
  [Analytics limitations](#analytics-limitations). No time-series, referrer,
  device or geographic data is recorded.
- **No pagination** — `GET /api/links` returns every link the user owns. Fine at
  portfolio scale; a real deployment would add paging.

Where a capability is missing, the relevant page says so plainly rather than
showing fabricated numbers.

**Technical debt worth naming**

| Item | Impact | Why it was left |
| --- | --- | --- |
| `Link` has no `@CreatedDate` auditing | No chronological ordering or per-link timestamp is possible | Adding a timestamp column is a schema change plus an API change the frontend has no contract for; the migration is straightforward (`ALTER TABLE links ADD COLUMN created_at ...`) but it is a product decision, not a hardening fix |
| Short-code generation is check-then-insert | Two simultaneous requests could generate the same code | The `UNIQUE` constraint rejects the loser, so correctness is preserved; the retry is the honest fix and is noted rather than hidden behind a lock |
| Click counting is synchronous with the redirect | A slow database adds latency to every redirect | The increment must not be lost, so it commits before the redirect is issued. An async queue would need infrastructure this project deliberately avoids (and a counter that can silently drop writes) |
| Registration uniqueness race | Two simultaneous registrations can both pass the pre-check | The database constraint rejects the loser, and `DataIntegrityViolationException` is translated into the same 409 the pre-check produces |

---

## License

Developed as a portfolio project. See the repository owner for licensing details.
