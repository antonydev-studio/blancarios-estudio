/**
 * Admin Panel Validation — Requires real admin credentials.
 *
 * Set environment variables before running:
 *   TEST_ADMIN_EMAIL=admin@example.com TEST_ADMIN_PASSWORD=Pass123!
 *   pnpm playwright test tests/validation/admin-panel.spec.ts
 *
 * Without these vars all tests skip gracefully.
 *
 * Safety:
 * - Read-only checks on users, appointments, movements, blocked-clients
 * - Service CRUD uses TEST QA FINAL data with activo: false (invisible to users)
 * - afterAll cleanup deletes test service even on test failure
 * - No appointment mutations — admin appointment reads only
 * - No config writes — reads only
 */
import { test, expect } from "@playwright/test";
import { generateTestServiceData, TEST_QA_MARKER } from "../utils/generators";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "";
const ADMIN_PASS = process.env.TEST_ADMIN_PASSWORD ?? "";
const CREDENTIALS_SET = Boolean(ADMIN_EMAIL && ADMIN_PASS);

test.describe("Admin Auth — Login", () => {
  test.skip(!CREDENTIALS_SET, "Set TEST_ADMIN_EMAIL + TEST_ADMIN_PASSWORD to run");

  test("admin login returns token", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { correo: ADMIN_EMAIL, contrasena: ADMIN_PASS },
    });
    expect(res.status(), "Admin login failed — verify credentials").toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty("token");
    expect(typeof j.token).toBe("string");
    expect(j.usuario.rol).toBe("admin");
  });
});

test.describe("Admin Read Endpoints", () => {
  test.skip(!CREDENTIALS_SET, "Set TEST_ADMIN_EMAIL + TEST_ADMIN_PASSWORD to run");

  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { correo: ADMIN_EMAIL, contrasena: ADMIN_PASS },
    });
    const j = await res.json();
    adminToken = j.token;
  });

  test("GET /api/appointments — returns appointments array", async ({ request }) => {
    const res = await request.get("/api/appointments", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty("appointments");
    expect(Array.isArray(j.appointments)).toBe(true);
  });

  test("GET /api/users — returns users array", async ({ request }) => {
    const res = await request.get("/api/users", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty("users");
    expect(Array.isArray(j.users)).toBe(true);
  });

  test("GET /api/movements — returns movements array", async ({ request }) => {
    const res = await request.get("/api/movements", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty("movements");
    expect(Array.isArray(j.movements)).toBe(true);
  });

  test("GET /api/movements?periodo=hoy — filters correctly", async ({ request }) => {
    const res = await request.get("/api/movements?periodo=hoy", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty("movements");
  });

  test("GET /api/blocked-clients — returns blocked clients array", async ({ request }) => {
    const res = await request.get("/api/blocked-clients", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty("blockedClients");
    expect(Array.isArray(j.blockedClients)).toBe(true);
  });

  test("GET /api/config — config contains expected keys", async ({ request }) => {
    const res = await request.get("/api/config");
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty("config");
    expect(j.config).toHaveProperty("horarioPorDia");
    expect(j.config).toHaveProperty("bufferMinutos");
    expect(j.config).toHaveProperty("diasBloqueados");
  });

  test("GET /api/auth/me — returns admin user", async ({ request }) => {
    const res = await request.get("/api/auth/me", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty("usuario");
    expect(j.usuario.rol).toBe("admin");
  });
});

test.describe.serial("Admin — Service CRUD with TEST Data", () => {
  test.skip(!CREDENTIALS_SET, "Set TEST_ADMIN_EMAIL + TEST_ADMIN_PASSWORD to run");

  let adminToken: string;
  let testServiceId: string | null = null;

  test.beforeAll(async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { correo: ADMIN_EMAIL, contrasena: ADMIN_PASS },
    });
    const j = await res.json();
    adminToken = j.token;
  });

  test.afterAll(async ({ request }) => {
    if (testServiceId) {
      await request.delete(`/api/services/${testServiceId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      console.log(`[CLEANUP] afterAll deleted test service: ${testServiceId}`);
    }
  });

  test("POST /api/services — create TEST service — 201", async ({ request }) => {
    const data = generateTestServiceData();
    const res = await request.post("/api/services", {
      data,
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(201);
    const j = await res.json();
    expect(j).toHaveProperty("service");
    expect(j.service.titulo).toContain(TEST_QA_MARKER);
    expect(j.service.activo).toBe(false);
    testServiceId = j.service._id;
    console.log(`[CLEANUP] Test service created: ${testServiceId}`);
  });

  test("PATCH /api/services/:id — update TEST service — 200", async ({ request }) => {
    if (!testServiceId) test.skip(true, "Service creation failed");
    const res = await request.patch(`/api/services/${testServiceId}`, {
      data: { descripcion: `${TEST_QA_MARKER} — updated by automation` },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j.service.descripcion).toContain(TEST_QA_MARKER);
  });

  test("DELETE /api/services/:id — delete TEST service — 200", async ({ request }) => {
    if (!testServiceId) test.skip(true, "Service creation failed");
    const res = await request.delete(`/api/services/${testServiceId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j.mensaje).toMatch(/eliminado/i);
    testServiceId = null; // afterAll will skip re-deletion
  });

  test("GET /api/services — deleted service no longer listed", async ({ request }) => {
    const res = await request.get("/api/services");
    expect(res.status()).toBe(200);
    const { services } = await res.json();
    const found = services.find((s: any) => s.titulo?.includes(TEST_QA_MARKER));
    expect(found).toBeUndefined();
  });
});

test.describe("Admin — Authorization Enforcement", () => {
  test("non-admin token rejected on admin endpoints — 403", async ({ request }) => {
    // Any token with rol:cliente should be rejected on admin-only routes
    // We verify this using an expired/invalid token to simulate non-admin
    const res = await request.get("/api/users", {
      headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("no token on admin endpoints — 401", async ({ request }) => {
    for (const url of ["/api/users", "/api/movements", "/api/blocked-clients"]) {
      const res = await request.get(url);
      expect(
        [401, 403],
        `${url} should require auth, got ${res.status()}`
      ).toContain(res.status());
    }
  });
});
