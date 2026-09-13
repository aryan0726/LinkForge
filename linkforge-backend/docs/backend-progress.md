# LinkForge Backend Progress

## ✅ Implemented

### Infrastructure
- Spring Boot 3.5.6 on Java 21
- PostgreSQL 16 via Spring Data JPA
- Flyway migrations (`V1__baseline_schema.sql`), `ddl-auto: validate`
- Environment-variable configuration with a `dev` profile for zero-setup local runs

### Authentication
- JWT issuance and validation (HS256, jjwt), secret length enforced at startup
- Register API — `201`, BCrypt hashing, duplicate detection returning `409`
- Login API — `200`, identical `401` for wrong password and unknown email
- Stateless request filter that never throws; malformed tokens resolve to `401`

### Links
- Create Short URL API — `201`, validated target URL, short code from `SecureRandom`
- Redirect API — public `GET /{shortCode}`, atomic click increment, `302`
- My Links API — user-scoped listing and lookup

### Cross-cutting
- `@RestControllerAdvice` with one error envelope
  (`timestamp, status, error, message, path`) plus per-field `fieldErrors`
- Bean Validation on all request DTOs, including a custom `@ValidHttpUrl`
- 401/403 kept distinct; `WWW-Authenticate: Bearer` on auth failures

### Testing
- 62 tests against real PostgreSQL, covering auth, links, redirect
  (including concurrency), security boundaries, ownership and response shapes

---

## ⛔ Not implemented — deliberately out of scope

These are **not** planned work. They are absent by choice, and the frontend is
written to be honest about it rather than implying otherwise.

| Feature | Why it is absent |
| --- | --- |
| Delete Link | No endpoint exists. The UI does not offer the action. |
| Update Link | No endpoint exists. Links are immutable once created. |
| Custom aliases | Short codes are always generated; users cannot choose them. |
| Per-link analytics | Only a single total `clickCount` per link is stored. No timestamps, referrers, geography or device data is collected, so none can be displayed. |
| QR codes | Not generated, not stored. |
| Click rate limiting | Requires infrastructure (proxy or shared store) beyond the app. **Highest residual risk:** login is likewise not rate limited. |

If any of these are wanted, they are new features requiring a schema change, an
entity change and an API contract change — not hardening.

---

## ⚠️ Known limitations

- **`links` has no `created_at`.** The table stores only `id` (a random UUID),
  `user_id`, `original_url`, `short_code`, `click_count` and `active`. Listing
  therefore orders by `id DESC`, which is **stable but not chronological**.
  Adding a timestamp means a schema + entity + API change.
- **Two check-then-insert races remain** (short-code generation, registration
  uniqueness). Both are protected by unique constraints and cannot corrupt
  data; they can only surface as a retry or a `409`.
- **`active` is always `true`.** The column exists but no endpoint changes it.

See `PRODUCTION_HARDENING_REPORT.md` at the repository root for the full audit,
including the defects that were fixed and the reasoning behind each remaining
limitation.
