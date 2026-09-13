/**
 * Unit checks for the pure helpers in `src/services/config.js`.
 *
 * Plain Node, no test framework — matching `verify-contract.mjs`. There is no
 * test runner in this project and adding one was judged out of scope, but the
 * `resolveShortUrl` bug this guards against was silent and production-only, so
 * it needs a permanent check.
 *
 * Run with:  npm run test:unit
 */

import { resolveShortUrl } from "./src/services/config.js";

let passed = 0;
let failed = 0;

function check(label, actual, expected) {
  if (actual === expected) {
    console.log(`  PASS  ${label}`);
    passed += 1;
  } else {
    console.log(`  FAIL  ${label}`);
    console.log(`        expected: ${expected}`);
    console.log(`        actual:   ${actual}`);
    failed += 1;
  }
}

console.log("\nresolveShortUrl");

// The server is authoritative. `shortUrl` is built from the backend's own
// APP_BASE_URL, which is the host that actually serves the redirect and may
// differ from the API host. Overshadowing it client-side produces a dead link.
check(
  "prefers the server value even when it differs from the API origin",
  resolveShortUrl({ shortCode: "abc123", shortUrl: "https://sho.rt/abc123" }),
  "https://sho.rt/abc123",
);

check(
  "uses the server value verbatim in the local dev case",
  resolveShortUrl({ shortCode: "abc123", shortUrl: "http://localhost:8080/abc123" }),
  "http://localhost:8080/abc123",
);

// Fallback path: an older backend that omits shortUrl.
check(
  "falls back to the derived URL when shortUrl is absent",
  resolveShortUrl({ shortCode: "abc123" }),
  "http://localhost:8080/abc123",
);

check(
  "falls back when shortUrl is an empty string",
  resolveShortUrl({ shortCode: "abc123", shortUrl: "" }),
  "http://localhost:8080/abc123",
);

check("returns an empty string for null", resolveShortUrl(null), "");
check("returns an empty string for undefined", resolveShortUrl(undefined), "");
check("returns an empty string when neither field is present", resolveShortUrl({}), "");

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
