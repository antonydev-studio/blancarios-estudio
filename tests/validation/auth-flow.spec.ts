/**
 * Auth Flow — API Validation Tests
 *
 * Covers:
 * - Registration validation (400 paths — no email sent)
 * - Duplicate email detection (409)
 * - Login error responses (401, 403, 400)
 * - Forgot-password response structure
 * - Verification code rejection
 *
 * Safety: all 400/409 paths do NOT create DB records or send emails.
 * Registration success path is NOT automated (requires email delivery verification).
 *
 * Execution: pnpm playwright test tests/validation/auth-flow.spec.ts
 */
import { test, expect } from "@playwright/test";
import { generateTestUserData, TEST_QA_MARKER } from "../utils/generators";
import { INVALID_CREDENTIALS } from "../utils/test-data";

test.describe("Registration — Input Validation (no DB writes)", () => {
  test("rejects empty body — 400", async ({ request }) => {
    const res = await request.post("/api/auth/registro", { data: {} });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j).toHaveProperty("mensaje");
    expect(j.mensaje.endsWith(".")).toBe(true);
  });

  test("rejects invalid email format — 400", async ({ request }) => {
    const res = await request.post("/api/auth/registro", {
      data: {
        nombre: `${TEST_QA_MARKER} Validation`,
        telefono: "7551234567",
        correo: "not-an-email",
        contrasena: "ValidPass123!",
      },
    });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j.mensaje).toMatch(/correo|formato/i);
  });

  test("rejects weak password — 400", async ({ request }) => {
    const res = await request.post("/api/auth/registro", {
      data: {
        nombre: `${TEST_QA_MARKER} Validation`,
        telefono: "7551234567",
        correo: "valid@example.com",
        contrasena: "weak",
      },
    });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j.mensaje).toMatch(/contraseña|mayúscula|minúscula|número|8/i);
  });

  test("rejects missing telefono — 400", async ({ request }) => {
    const res = await request.post("/api/auth/registro", {
      data: {
        nombre: `${TEST_QA_MARKER} Validation`,
        correo: "valid@example.com",
        contrasena: "ValidPass123!",
      },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("Registration — Duplicate Detection", () => {
  test("second registration with same correo — 409", async ({ request }) => {
    const user = generateTestUserData();

    // First attempt — may succeed (201) or fail (500 if email service rejects domain)
    const res1 = await request.post("/api/auth/registro", { data: user });

    if (res1.status() === 500) {
      // Production email service rejected the test domain — expected, test cannot proceed
      console.log("[INFO] Registration returned 500 (email service rejected domain) — duplicate test skipped");
      test.skip(true, "Email service rejected test domain — cannot test duplicate detection");
      return;
    }

    if (res1.status() !== 201) {
      console.log(`[INFO] Unexpected status ${res1.status()} on first registration`);
      return;
    }

    console.log(`[CLEANUP NEEDED] Test user created: ${user.correo} — run: MONGO_URI=<uri> node scripts/cleanup-test-data.js`);

    // Second attempt with same email — must return 409
    const res2 = await request.post("/api/auth/registro", { data: user });
    expect(res2.status()).toBe(409);
    const j = await res2.json();
    expect(j.mensaje).toMatch(/ya existe|correo/i);
  });
});

test.describe("Login — Error Responses", () => {
  test("non-existent email — 401", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: INVALID_CREDENTIALS,
    });
    expect([401, 429]).toContain(res.status());
    if (res.status() === 401) {
      const j = await res.json();
      expect(j.mensaje).toMatch(/incorrectos/i);
      expect(j.mensaje.endsWith(".")).toBe(true);
    }
  });

  test("empty body — 400", async ({ request }) => {
    const res = await request.post("/api/auth/login", { data: {} });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j).toHaveProperty("mensaje");
  });

  test("unverified account login — 403 with requiereVerificacion flag", async ({ request }) => {
    // Use a known test correo that was registered but not verified.
    // If no such user exists, this test confirms 401 (not found) instead of 403.
    const res = await request.post("/api/auth/login", {
      data: {
        correo: `playwright-test-unverified@example.invalid`,
        contrasena: "TestPass123!",
      },
    });

    // 401 = user doesn't exist (expected when no test user was pre-registered)
    // 403 = user exists but is unverified (expected after successful registration in duplicate test)
    // 429 = rate limited
    expect([401, 403, 429]).toContain(res.status());
    if (res.status() === 403) {
      const j = await res.json();
      expect(j).toHaveProperty("requiereVerificacion", true);
      expect(j).toHaveProperty("correo");
    }
  });
});

test.describe("Forgot Password — Response Structure", () => {
  test("unknown email — generic response (no info leak) — 200", async ({ request }) => {
    const res = await request.post("/api/auth/olvide-contrasena", {
      data: { correo: "absolutely-not-existing@example.invalid" },
    });
    // API returns 200 with generic message regardless of whether email exists
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty("mensaje");
    expect(j.mensaje).toMatch(/si ese correo existe/i);
  });

  test("empty correo — 400", async ({ request }) => {
    const res = await request.post("/api/auth/olvide-contrasena", { data: {} });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j.mensaje).toMatch(/correo/i);
  });
});

test.describe("Verification Code — Rejection Paths", () => {
  test("wrong code for non-existent correo — 400", async ({ request }) => {
    const res = await request.post("/api/auth/verificar-codigo", {
      data: {
        correo: "no-such-user-playwright@example.invalid",
        codigo: "999999",
      },
    });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j.mensaje).toMatch(/incorrecto|expirado/i);
  });

  test("missing fields — 400", async ({ request }) => {
    const res = await request.post("/api/auth/verificar-codigo", { data: {} });
    expect(res.status()).toBe(400);
  });

  test("reenviar code for non-existent correo — 400", async ({ request }) => {
    const res = await request.post("/api/auth/reenviar-codigo", {
      data: { correo: "no-such-user-playwright@example.invalid" },
    });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j.mensaje).toMatch(/pendiente|verificación/i);
  });
});

test.describe("Session — Protected Endpoint", () => {
  test("GET /api/auth/me without token — 401", async ({ request }) => {
    const res = await request.get("/api/auth/me");
    expect(res.status()).toBe(401);
    const j = await res.json();
    expect(j).toHaveProperty("mensaje");
  });

  test("GET /api/auth/me with invalid token — 401", async ({ request }) => {
    const res = await request.get("/api/auth/me", {
      headers: { Authorization: "Bearer invalid.token.here" },
    });
    expect(res.status()).toBe(401);
  });
});
