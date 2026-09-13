# LinkForge — Production Hardening: Final Report

**Scope:** the existing LinkForge full-stack project (Spring Boot 3.5.6 + React 19)
**Constraint honoured:** no rewrite. Architecture, tech stack, UI and all working
functionality were preserved. Every change is additive or a targeted fix.

---

## 1. Build and test results

| Check | Result |
| --- | --- |
| Backend compile | **PASS** |
| Backend tests | **62 tests, 0 failures, 0 errors** |
| Backend package | **BUILD SUCCESS** |
| Frontend lint | **PASS** (0 problems) |
| Frontend unit checks | **7 assertions, 0 failures** |
| Frontend build | **PASS** (135 modules, 406.83 kB JS / 121.86 kB gzip) |
| Live contract check | **35 assertions, 0 failures** |
| Flyway on existing DB | **PASS** — 22 users / 19 links preserved |

Verification was done against a real PostgreSQL 16 database, not a substitute.
`ddl-auto: validate` means the application only starts if the Flyway migrations
and the JPA entities agree exactly — so a green build proves the schema is
correct, not merely that the code compiles.

---

## 2. Files changed

### Backend — modified (16)

| File | Change |
| --- | --- |
| `config/SecurityConfig.java` | Wired the 401 entry point, configurable CORS, tightened path rules |
| `controller/AuthController.java` | Added `@Valid`; register returns 201 |
| `controller/LinkController.java` | Added `@ResponseStatus(CREATED)`; removed the stray `// <-- ADD THIS` comment |
| `controller/UserController.java` | Returns `UserResponse` instead of the entity |
| `dto/link/CreateLinkRequest.java` | `@ValidHttpUrl`, `@Size(2048)` |
| `dto/request/LoginRequest.java` | `@NotBlank` on both fields |
| `dto/request/RegisterRequest.java` | Full constraint set on all four fields |
| `repository/LinkRepository.java` | Atomic increment; user-scoped query |
| `security/jwt/JwtService.java` | `Optional`-returning extraction, all failure modes caught |
| `security/jwt/JwtAuthenticationFilter.java` | Never throws; tolerant header parsing |
| `service/impl/AuthServiceImpl.java` | Typed exceptions; concurrent-insert handling |
| `service/impl/LinkServiceImpl.java` | Configurable base URL; atomic increment; ownership scoping |
| `util/ShortCodeGenerator.java` | Documented; rejects non-positive length |
| `resources/application.yaml` | Env-var driven; `ddl-auto: validate`; Flyway enabled |
| `test/…/LinkforgeBackendApplicationTests.java` | Test profile; explains why it matters |
| `.gitignore` | Ignores `.env`, keys, local overrides |

### Backend — new (19)

```
dto/response/UserResponse.java                    Validation/error handling:
exception/ApplicationException.java                 validation/ValidHttpUrl.java
exception/DuplicateResourceException.java           validation/ValidHttpUrlValidator.java
exception/ErrorCode.java
exception/ErrorResponse.java                      Security:
exception/ForbiddenException.java                   security/RestAuthenticationEntryPoint.java
exception/GlobalExceptionHandler.java
exception/InvalidUrlException.java                Configuration & schema:
exception/ResourceNotFoundException.java            resources/application-dev.yaml
exception/UnauthorizedException.java                resources/db/migration/V1__baseline_schema.sql
                                                    .env.example
Tests:
  test/java/com/linkforge/api/AuthenticationApiTest.java
  test/java/com/linkforge/api/LinkApiTest.java
  test/java/com/linkforge/api/RedirectApiTest.java
  test/java/com/linkforge/api/SecurityBoundaryTest.java
  test/java/com/linkforge/api/UserProfileApiTest.java
  test/java/com/linkforge/support/IntegrationTestBase.java
  test/java/com/linkforge/support/TestTokens.java
  test/resources/application-test.yaml
```

### Frontend — modified (5)

| File | Change |
| --- | --- |
| `src/services/errors.js` | Rewritten — obsolete 403 workaround removed, `fieldErrors` parsing added. **Also fixed a syntax bug: a duplicated, unterminated JSDoc block.** |
| `src/services/apiClient.js` | Only 401 triggers sign-out (was 401 + 403) |
| `src/services/authService.js` | Removed the now-pointless `signals` guessing parameter |
| `src/services/config.js` | `resolveShortUrl` now prefers the server value instead of overriding it (Issue 14); guarded `import.meta.env` so the module is testable under plain Node |
| `package.json` | Replaced stale test scripts; added `test:contract` and `test:unit`; `npm test` now runs lint → unit → build |

### Frontend — new (2)

- `verify-contract.mjs` — 35 live assertions against a running backend
- `verify-units.mjs` — 7 unit assertions for `resolveShortUrl` (no backend needed)

### Removed

- `frontend/smoke-imports.mjs`, `e2e-integration.mjs`, `run-integration.mjs` —
  temporary debug scripts left from an earlier session.

---

## 3. Security issues fixed

| # | Issue | Severity | Fix |
| --- | --- | --- | --- |
| 1 | **`GET /api/user/me` returned the BCrypt password hash.** Confirmed live: `"password":"$2a$10$la27UgkY…"` | **Critical** | Dedicated `UserResponse` DTO; the mapping is explicit so a future column cannot leak by default. Test pins the exact field set. |
| 2 | **JWT secret and DB password hardcoded** in `application.yaml` | **Critical** | Moved to env vars. `JWT_SECRET` has *no default* — the app refuses to start without it. Verified. |
| 3 | **Malformed JWT → HTTP 500.** Verified live | **High** | `JwtService` catches every JJWT failure mode and returns `Optional.empty()`. Now a clean 401. |
| 4 | **Missing token → 403 with `Content-Length: 0`** | **High** | Dedicated `RestAuthenticationEntryPoint` returns 401 + JSON + `WWW-Authenticate`. |
| 5 | **403 used for authentication failures**, making 401 and 403 indistinguishable | **High** | 401 = not authenticated; 403 = authenticated but not permitted. Frontend updated to match. |
| 6 | No server-side validation anywhere | **High** | Bean Validation on all request DTOs + `@Valid` at every boundary. |
| 7 | `not-a-url`, `hello`, `javascript:alert(1)` were all shortened successfully | **High** | Custom `@ValidHttpUrl` constraint using `java.net.URI`. |
| 8 | No global exception handler; empty error bodies | **Medium** | `@RestControllerAdvice` with one consistent JSON shape. |
| 9 | `if (!header.regionMatches(...))` — an empty Bearer token reached the parser | **Medium** | `resolveToken()` handles null/blank/missing-prefix/empty-token. |
| 10 | CORS origin hardcoded in Java | **Medium** | Configurable via `CORS_ALLOWED_ORIGINS`; `*` rejected at startup. Verified. |
| 11 | No startup guard on secret strength | **Low** | `JwtService` requires ≥32 bytes for HS256 and fails on boot. |
| 12 | Server error details potentially exposed | **Low** | `include-message/stacktrace/binding-errors: never`; tests assert no class names, stack frames or exception names appear in any error body. |

### Issue 13 — found by live verification, after the test suite was green

This one is worth reading, because it is the clearest evidence that a green test
suite is not the same thing as a correct system.

**Symptom:** `GET /api/nonexistent` with a *valid* token returned **HTTP 500**.

**How it was found:** not by a test — every test passed. It was found by
running the packaged jar and issuing requests by hand. The running process
logged:

```
ERROR c.l.exception.GlobalExceptionHandler : Unhandled exception on GET /api/nonexistent
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/nonexistent.
```

**Root cause:** Spring Boot 3.2 replaced `NoHandlerFoundException` with
`NoResourceFoundException` for unmapped paths. The handler registered only the
legacy type, so the exception matched nothing and fell through to the catch-all
`Exception` branch — which correctly returns a bare 500. The exception handler
was working exactly as written; the *written* handler was out of date with the
framework version it targeted.

**Fix** — `exception/GlobalExceptionHandler.java`:

```java
@ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
public ResponseEntity<ErrorResponse> handleNoHandler(
        Exception ex, HttpServletRequest request) {

    return build(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND,
            "No endpoint found for this path", request, null);
}
```

Both types are kept: `NoResourceFoundException` is the live path, and
`NoHandlerFoundException` is retained because it is still raised when static
resource handling is disabled (`spring.web.resources.add-mappings: false`) — a
plausible production configuration. Handling both costs nothing and removes a
version/configuration trap.

**Verified after the fix** (rebuilt jar, live):

| Request | Before | After |
| --- | --- | --- |
| `GET /api/nonexistent` + valid token | 500 + stack trace in log | **404** + `{"error":"NOT_FOUND"}` |
| `GET /api/links/does/not/exist` + valid token | 500 | **404** |
| `GET /api/nonexistent`, no token | 403 empty | **401** (unchanged, still correct) |
| Server log at WARN or above | full `NoResourceFoundException` trace | **none** |

The anonymous case matters: routing is still evaluated *after* authentication,
so an unauthenticated caller gets 401 rather than 404 and cannot use the status
code as an oracle for which `/api/**` routes exist.

**Why the tests missed it:** the suite only ever requested paths that exist.
Guard tests are only as good as the inputs they are given — the missing case was
"a path that is not mapped at all". Three regression tests were added to cover
exactly that blind spot (§6).

### Non-issues, deliberately kept

- **CSRF stays disabled** — correct for stateless Bearer auth. There is no cookie,
  so a browser cannot be tricked into attaching another site's `Authorization`
  header. Documented in `SecurityConfig` and the README.
- **404 for another user's resource rather than 403** — prevents enumerating
  whether a short code exists. Documented.
- **Identical 401 for unknown email and wrong password** — prevents account
  enumeration. Covered by a test asserting the two bodies are byte-identical
  apart from the timestamp.

---

## 4. Validation improvements

| DTO | Constraints |
| --- | --- |
| `RegisterRequest` | `fullName` `@NotBlank @Size(2–80)` · `username` `@NotBlank @Size(3–30) @Pattern(^[a-zA-Z0-9._-]+$)` · `email` `@NotBlank @Email @Size(≤254)` · `password` `@NotBlank @Size(8–72)` |
| `LoginRequest` | `@NotBlank` only — deliberately no format rules, to avoid revealing which part of a credential guess was structurally wrong |
| `CreateLinkRequest` | `@NotBlank @Size(≤2048) @ValidHttpUrl` |

`@Valid` is now applied at every controller boundary. The 72-character password
ceiling is BCrypt's effective input limit, so accepting more would give a false
sense of strength.

`ValidHttpUrlValidator` uses `java.net.URI`, not `java.net.URL` — `URL` performs
DNS resolution in some equality paths, and a validator must never do network I/O.
It accepts `localhost` and IP hosts (useful in development) and rejects bare
words, non-http schemes and malformed hosts.

Verified live: `hello`, `abc`, `not-a-url`, `javascript:alert(1)`,
`ftp://…`, `mailto:…` and `data:…` all → **400**. `http://localhost:3000/dev`,
`https://sub.domain.example.co.uk:8443/path` and `https://192.168.1.10:8080/…`
all → **201**.

---

## 5. Database and migration improvements

**Before:** Flyway was `enabled: false` with zero migration files, and the schema
was created by `ddl-auto: update` — meaning production schema changes happened
implicitly and irreversibly.

**After:**

- `V1__baseline_schema.sql` captured from a live `pg_dump`, matching the entities
  exactly.
- `ddl-auto: validate` in every profile — the application refuses to start if
  migrations and entities disagree.
- Flyway `baseline-on-migrate: true`, `baseline-version: 0`, `validate-on-migrate: true`.
- `idx_links_user_id` added for the user-scoped list query.

**No data was destroyed.** The migration is idempotent (`IF NOT EXISTS`) and no
migration contains a `DROP`. This was verified against the real development
database, not a fresh one:

```
Successfully baselined schema with version: 0
Migrating schema "public" to version "1 - baseline schema"
DB: relation "users" already exists, skipping
DB: relation "links" already exists, skipping
Successfully applied 1 migration ... now at version v1
Started LinkforgeBackendApplication in 9.339 seconds
```

`users` and `links` still contain **22 and 19 rows** afterwards, and `Started` is
the proof that `validate` accepted the schema.

---

## 6. Testing added

**3 meaningful tests → 62.** No coverage padding; each test maps to a defect or a
contract.

| Suite | Tests | Covers |
| --- | --- | --- |
| `AuthenticationApiTest` | 17 | Registration, hashing, duplicate email/username, blank/short/illegal fields, empty body, malformed JSON, email casing; login, wrong password, unknown user, disabled account, enumeration resistance |
| `LinkApiTest` | 12 | Creation, configured base URL, invalid URLs, non-http schemes, blank URL, legitimate URLs, unauthenticated rejection, distinct codes, own-links-only, response shape |
| `RedirectApiTest` | 8 | 302 target, unknown code 404, public access, single/repeated clicks, **25 concurrent clicks**, zero state, inactive links |
| `SecurityBoundaryTest` | 16 | 401 vs 403, JSON body present, `WWW-Authenticate`, malformed/tampered/expired/wrong-key tokens, non-Bearer scheme, empty Bearer, no internal leakage, public endpoints, **unknown-path routing (3)** |
| `UserProfileApiTest` | 8 | Profile correctness, **no password leak**, exact field set, role, 401, parameter tampering, deleted account, stale token on auth paths |

Counts are Surefire's own aggregate (`Tests run: 62, Failures: 0, Errors: 0,
Skipped: 0`), not a hand count. Note that `AuthenticationApiTest` (17) and
`LinkApiTest` (12) are split across JUnit 5 `@Nested` classes, so per-file
report files show `Tests run: 0` for the outer class while the real counts
appear under the `@DisplayName`-ed nested containers — read the aggregate line,
not an individual suite file.

### The routing regression tests

These were added *after* the initial suite was green, because the suite had a
blind spot: it only ever probed paths that exist.

```
SecurityBoundaryTest.unknownPathReturnsNotFound
      -> GET /api/nonexistent with a valid token asserts 404 + error == NOT_FOUND
SecurityBoundaryTest.unknownPathWithoutTokenReturnsUnauthorized
      -> same path, no token, asserts 401 (auth is checked before routing,
         so an anonymous caller cannot use status codes to enumerate routes)
SecurityBoundaryTest.unknownPathDoesNotLeakInternals
      -> asserts the body contains no "No static resource",
         no "NoResourceFoundException", no "org.springframework"
```

They exist because a **500** was found here by live testing while every test
passed — see the note in §3.

### The concurrency test

The clearest single demonstration of the value here:

```
RedirectApiTest.concurrentClicksAreNotLost
  25 simultaneous HTTP requests to one short link
  asserts click_count == 25, exactly
```

The old read-modify-write implementation loses increments under contention; the
new atomic `UPDATE ... SET click_count = click_count + 1` cannot.

Tests run against **real PostgreSQL**, not H2 — the migrations are PostgreSQL
dialect, and H2 would either reject them or accept a subtly different schema,
letting tests pass while production fails to boot.

---

## 7. API behaviour changes

These are intentional and the frontend was updated in the same pass.

| Endpoint | Before | After |
| --- | --- | --- |
| `POST /api/auth/register` | 200 | **201** |
| `POST /api/auth/login` | 200 / 403 empty | 200 / **401 + JSON** |
| `GET /api/user/me` | 200, **leaked password hash** | 200, DTO only |
| `POST /api/links` | 200, accepted anything | **201** / **400 + fieldErrors** |
| `GET /api/links` (no token) | 403, empty body | **401 + JSON** |
| Any malformed JWT | **500** | **401** |
| Unknown short code | 500 | **404 + JSON** |
| Unknown `/api/**` path (authenticated) | **500 + logged stack trace** | **404 + JSON** |
| Unknown `/api/**` path (no token) | 403, empty | **401 + JSON** |
| Duplicate account | 403, empty | **409 + `fieldErrors`** |
| `shortUrl` | hardcoded `localhost:8080` | from `APP_BASE_URL` |

**Frontend compatibility** was preserved deliberately: `extractServerMessage`
already read `data.message`, so the new error shape needed no UI change to
display correctly, and `fieldErrors` is the exact `{fieldName: message}` map the
forms already consume. The only frontend logic that *had* to change was the
401/403 assumption, which was a direct consequence of the backend fix.

---

## 8. What could not be safely implemented

**`Link` still has no creation timestamp.** This was requested implicitly
(ordering, per-link dates) but is *not* a hardening fix — it is a product change:

- It requires a schema migration **and** an entity change **and** an API contract
  change (`LinkResponse` gains a field the frontend has no design for).
- `GET /api/links` therefore orders by primary key descending — stable, but not
  chronological, since ids are random UUIDs. This is stated honestly in the code
  and the README rather than papered over, and the frontend prepends a
  newly-created link so the user experience is unaffected in practice.

Adding it is a small, well-understood change
(`ALTER TABLE links ADD COLUMN created_at TIMESTAMP(6) NOT NULL DEFAULT now()`),
and it is documented in the README's technical-debt table — but it changes the
API contract, so it was left as a deliberate decision rather than made silently.

**No backend Dockerfile.** The README previously claimed one existed. It does not.
Rather than ship an untested Dockerfile to make the documentation true, the claim
was corrected and the omission documented. Writing one is a ~15-line task.

**Two non-critical concurrency races remain**, both with correctness preserved by
database constraints and both documented:

- Short-code generation is check-then-insert. Two simultaneous requests *could*
  generate the same code; the `UNIQUE` constraint rejects the loser.
- Registration uniqueness is check-then-insert. Two simultaneous registrations
  *could* both pass the pre-check; the constraint rejects the loser and
  `DataIntegrityViolationException` is translated into the same 409.

Neither can produce corrupt data. A retry loop would eliminate both, but the
current behaviour is honest and bounded.

### Issue 14 — the one frontend change a backend fix made *necessary*

An earlier draft of this report claimed "no `APP_BASE_URL`-aware frontend
rewrite was needed", and that `resolveShortUrl` was harmless belt-and-braces
code. That was wrong, and testing it properly showed why.

**The bug.** `resolveShortUrl` checked `shortCode` *before* `shortUrl`:

```js
if (link.shortCode) return `${API_ORIGIN}/${link.shortCode}`;   // wins
return link.shortUrl || "";                                     // never reached
```

So it discarded the server's value on every response. That was written when the
backend hardcoded `http://localhost:8080/` — at the time, rebuilding client-side
genuinely was a fix. **Fixing the backend inverted the logic's value**: the
override became actively harmful.

**Why it matters.** The host serving the redirect is not necessarily the host
serving the API. With the API at `https://api.example.com/api` and
`APP_BASE_URL=https://sho.rt`:

| | Result |
| --- | --- |
| Server returns | `https://sho.rt/pB4fJm` |
| UI displayed (old) | `https://api.example.com/pB4fJm` — **nothing redirects here** |
| UI displayed (fixed) | `https://sho.rt/pB4fJm` |

**How it was missed.** The earlier `APP_BASE_URL=https://sho.rt` check inspected
the backend's JSON only. It never rendered what the UI would show, so the value
was correct in the API and wrong on screen. The 33 contract assertions also
missed it: the only `shortUrl` assertion tests `typeof === "string"`, which the
wrong URL satisfies. And it cannot reproduce locally, because in development the
API host and the short-link host are both `localhost:8080`.

**Fix.** Server value wins; the derived form is only a fallback when `shortUrl`
is absent. `verify-units.mjs` pins all three branches, and was confirmed to
**fail** against the old logic and pass against the new — a test that cannot
fail proves nothing.

**Lesson.** This is the same failure mode as Issue 13: both bugs lived in the
seam between two components, where each side's tests were individually green. A
backend assertion that the value is *correct* does not establish that the client
*uses* it.

---

## 9. Production-readiness score

| Area | Before | After |
| --- | --- | --- |
| Secrets management | 1/10 | **9/10** |
| Authentication | 4/10 | **9/10** |
| Authorization / data ownership | 5/10 | **9/10** |
| Input validation | 1/10 | **9/10** |
| Error handling / disclosure | 2/10 | **9/10** |
| Database / migrations | 2/10 | **9/10** |
| Testing | 1/10 | **8/10** |
| Configuration / deployability | 3/10 | **9/10** |
| Documentation accuracy | 4/10 | **9/10** |
| Code quality | 6/10 | **8/10** |

### **Overall: 3.0/10 → 8.7/10**

The project is now a credible portfolio piece and a defensible deployment. The
remaining gap to 10/10 is product scope, not engineering hygiene: pagination,
per-link timestamps, rate limiting, refresh tokens, and observability
(metrics/tracing) are all absent, and each is a deliberate omission rather than
an oversight.

---

## 10. Residual risks

| Risk | Severity | Note |
| --- | --- | --- |
| No rate limiting on `/api/auth/login` | Medium | Brute-forceable. Needs infrastructure (bucket4j, Redis, or an edge proxy) the brief explicitly ruled out. |
| No refresh tokens | Low | 24-hour tokens cannot be revoked before expiry. Add a denylist or short-lived tokens + refresh. |
| No link deletion | Low | Product gap; links can be deactivated in the database. |
| No pagination on `GET /api/links` | Low | Fine at portfolio scale. |
| Short-code collision race | Very low | Constraint-protected. ~5.7 × 10¹⁰ codes; the practical window is negligible. |

None of these blocks deployment for a portfolio project. The rate limiter is the
one worth adding first if this ever faces the public internet.
