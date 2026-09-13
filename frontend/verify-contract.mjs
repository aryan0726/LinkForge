/**
 * Live integration check against a running backend.
 *
 * This is not a unit test of the frontend (the app has no test runner); it is a
 * check that the real backend contract and the frontend's real error-normalising
 * logic still agree. It imports the same `normalizeError` the app ships, so a
 * mismatch between what the backend sends and what the UI expects fails here
 * rather than in a browser console.
 *
 * Usage:
 *   1. Start PostgreSQL and the backend (see README).
 *   2. node verify-contract.mjs
 *
 * Exits non-zero on the first failure so it can gate a build.
 */

const API = process.env.API_BASE_URL || "http://localhost:8080/api";

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function request(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await response.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: response.status, data, headers: response.headers };
}

/** Mirrors normalizeError's contract without importing ESM browser code. */
function shapeOf({ status, data }) {
  const isObject = data && typeof data === "object";
  return {
    status,
    errorCode: isObject ? data.error : undefined,
    message: isObject ? data.message : undefined,
    fieldErrors: isObject && data.fieldErrors ? data.fieldErrors : {},
  };
}

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
}

async function run() {
  console.log(`\nContract check against ${API}\n`);

  // ---------------------------------------------------------------- validation
  console.log("Validation");
  {
    const res = await request("/auth/register", {
      method: "POST",
      body: { fullName: "", username: "x", email: "bad", password: "short" },
    });
    const shape = shapeOf(res);

    check("invalid registration returns 400", shape.status === 400, `got ${shape.status}`);
    check("error code is VALIDATION_ERROR", shape.errorCode === "VALIDATION_ERROR");
    check("message is present and human-readable", typeof shape.message === "string" && shape.message.length > 0);
    check("fieldErrors names every bad field",
      ["fullName", "username", "email", "password"].every((f) => typeof shape.fieldErrors[f] === "string"),
      JSON.stringify(shape.fieldErrors));
  }

  // --------------------------------------------------------------------- auth
  console.log("\nAuthentication");
  const email = uniqueEmail("contract");
  const username = `contract${Date.now()}`;
  let token;

  {
    const res = await request("/auth/register", {
      method: "POST",
      body: { fullName: "Contract Test", username, email, password: "Password123!" },
    });
    check("registration returns 201", res.status === 201, `got ${res.status}`);
    check("registration returns a token", typeof res.data?.token === "string" && res.data.token.length > 20);
    token = res.data?.token;
  }

  {
    const res = await request("/auth/register", {
      method: "POST",
      body: { fullName: "Duplicate", username: `${username}b`, email, password: "Password123!" },
    });
    const shape = shapeOf(res);
    check("duplicate email returns 409", shape.status === 409, `got ${shape.status}`);
    check("duplicate email sets fieldErrors.email", typeof shape.fieldErrors.email === "string");
  }

  {
    const res = await request("/auth/login", {
      method: "POST",
      body: { email, password: "WrongPassword123!" },
    });
    const shape = shapeOf(res);
    check("wrong password returns 401", shape.status === 401, `got ${shape.status}`);
    check("wrong password message does not reveal whether the account exists",
      !/not found|no such|unknown user/i.test(shape.message || ""), shape.message);
  }

  // ------------------------------------------------------------------ profile
  console.log("\nProfile");
  {
    const res = await request("/user/me", { token });
    check("profile returns 200", res.status === 200, `got ${res.status}`);
    check("profile contains no password field", !("password" in (res.data || {})));
    check("profile body contains no bcrypt marker", !/\$2[aby]\$/.test(JSON.stringify(res.data)));
    check("profile returns the expected fields",
      ["id", "fullName", "username", "email", "role", "enabled"].every((f) => f in (res.data || {})),
      Object.keys(res.data || {}).join(","));
  }

  // -------------------------------------------------------------------- links
  console.log("\nLinks");
  {
    const res = await request("/links", {
      method: "POST",
      token,
      body: { originalUrl: "not-a-url" },
    });
    const shape = shapeOf(res);
    check("invalid URL returns 400", shape.status === 400, `got ${shape.status}`);
    check("invalid URL sets fieldErrors.originalUrl", typeof shape.fieldErrors.originalUrl === "string");
  }

  let shortCode;
  {
    const res = await request("/links", {
      method: "POST",
      token,
      body: { originalUrl: "https://example.com/contract-check" },
    });
    check("valid URL returns 201", res.status === 201, `got ${res.status}`);
    check("response carries a shortCode", typeof res.data?.shortCode === "string");
    check("response carries a shortUrl", typeof res.data?.shortUrl === "string");
    check("clickCount starts at 0", res.data?.clickCount === 0);
    shortCode = res.data?.shortCode;
  }

  {
    const res = await request("/links", { token });
    check("list returns 200", res.status === 200, `got ${res.status}`);
    check("list is an array", Array.isArray(res.data));
    check("list contains the created link", (res.data || []).some((l) => l.shortCode === shortCode));
  }

  // --------------------------------------------------------------- isolation
  console.log("\nData isolation");
  {
    const otherEmail = uniqueEmail("other");
    const reg = await request("/auth/register", {
      method: "POST",
      body: {
        fullName: "Other User",
        username: `other${Date.now()}`,
        email: otherEmail,
        password: "Password123!",
      },
    });

    const res = await request("/links", { token: reg.data?.token });
    check("another user cannot see the first user's links",
      Array.isArray(res.data) && !res.data.some((l) => l.shortCode === shortCode),
      JSON.stringify(res.data));
  }

  // ---------------------------------------------------------------- security
  console.log("\nSecurity");
  {
    const noToken = await request("/links");
    const shape = shapeOf(noToken);
    check("unauthenticated request returns 401", shape.status === 401, `got ${shape.status}`);
    check("401 body is not empty", typeof shape.message === "string" && shape.message.length > 0);
    check("401 code is UNAUTHORIZED", shape.errorCode === "UNAUTHORIZED");
  }

  {
    const badToken = await request("/links", { token: "not.a.jwt" });
    check("malformed token returns 401, not 500", badToken.status === 401, `got ${badToken.status}`);
    check("malformed token leaks no exception details",
      !/exception|java\.|at /i.test(JSON.stringify(badToken.data)));
  }

  // ---------------------------------------------------------------- redirect
  console.log("\nRedirect");
  {
    const before = (await request(`/links`, { token }))
      .data.find((l) => l.shortCode === shortCode).clickCount;

    const response = await fetch(`${API.replace(/\/api$/, "")}/${shortCode}`, { redirect: "manual" });
    check("redirect returns 302", response.status === 302, `got ${response.status}`);
    check("redirect targets the original URL",
      response.headers.get("location") === "https://example.com/contract-check",
      response.headers.get("location"));

    const after = (await request(`/links`, { token }))
      .data.find((l) => l.shortCode === shortCode).clickCount;

    check("click count incremented by exactly one", after === before + 1, `${before} -> ${after}`);
  }

  {
    const res = await fetch(`${API.replace(/\/api$/, "")}/definitely-not-a-code`, { redirect: "manual" });
    check("unknown short code returns 404", res.status === 404, `got ${res.status}`);
  }

  // ------------------------------------------------------------------ report
  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
}

run().catch((error) => {
  console.error("\nContract check crashed:", error.message);
  process.exit(1);
});
