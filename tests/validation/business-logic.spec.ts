/**
 * Business Logic Validation — Core booking rules.
 *
 * Tests (non-destructive unless noted):
 * - Past date rejection (no DB write)
 * - Blocked day rejection (no DB write — reads prod config)
 * - Closed weekday rejection (no DB write — reads prod config)
 * - Outside business hours rejection (no DB write)
 * - Conflict prevention + buffer enforcement (WRITES — labeled TEST QA FINAL)
 * - Occupied slots API structure
 *
 * Cleanup after mutation tests: MONGO_URI=... node scripts/cleanup-test-data.js
 *
 * Execution: pnpm playwright test tests/validation/business-logic.spec.ts
 */
import { test, expect } from "@playwright/test";
import { futureDateStr, generateTestBookingData, TEST_QA_MARKER } from "../utils/generators";

type Config = {
  diasBloqueados?: string[];
  diasAbiertosExcepcion?: string[];
  horarioPorDia?: Record<string, { inicio: number; fin: number; cerrado?: boolean }>;
  bufferMinutos?: number;
};

test.describe("Business Logic — Date/Time Validation (read-only)", () => {
  let serviceId: string;
  let serviceDuracion: number;
  let servicePrecio: number;
  let cfg: Config;

  test.beforeAll(async ({ request }) => {
    const [svcRes, cfgRes] = await Promise.all([
      request.get("/api/services"),
      request.get("/api/config"),
    ]);
    const { services } = await svcRes.json();
    const svc = services.find((s: any) => s.activo !== false) ?? services[0];
    serviceId = svc._id;
    serviceDuracion = svc.duracion;
    servicePrecio = svc.precio;
    cfg = (await cfgRes.json()).config ?? {};
  });

  test("rejects past date — 400 with 'pasadas' message", async ({ request }) => {
    const res = await request.post("/api/appointments", {
      data: {
        ...generateTestBookingData(serviceId, serviceDuracion, servicePrecio),
        fecha: "2024-01-15",
      },
    });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j.mensaje).toMatch(/pasadas/i);
  });

  test("rejects booking on blocked day — 400", async ({ request }) => {
    const blocked = cfg.diasBloqueados ?? [];
    if (!blocked.length) {
      console.log("[INFO] No blocked days configured — skipping blocked day test");
      test.skip(true, "No diasBloqueados in production config");
      return;
    }
    // Use the first blocked day that's in the future
    const futureBlocked = blocked.find((d) => d >= new Date().toISOString().split("T")[0]);
    if (!futureBlocked) {
      test.skip(true, "All blocked days are in the past");
      return;
    }
    const res = await request.post("/api/appointments", {
      data: {
        ...generateTestBookingData(serviceId, serviceDuracion, servicePrecio),
        fecha: futureBlocked,
        hora: "3:00 PM",
      },
    });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j.mensaje).toMatch(/cerrado/i);
  });

  test("rejects booking on closed weekday — 400", async ({ request }) => {
    // Find a weekday that's marked as cerrado and at least 30 days ahead
    const horarioPorDia = cfg.horarioPorDia ?? {};
    const closedDays = Object.entries(horarioPorDia)
      .filter(([, h]) => h.cerrado)
      .map(([dow]) => Number(dow));

    if (!closedDays.length) {
      console.log("[INFO] No cerrado weekdays in config — skipping");
      test.skip(true, "No closed weekdays in production config");
      return;
    }

    // Find a date 30-100 days ahead that falls on a closed weekday
    let testDate: string | null = null;
    for (let i = 30; i < 100; i++) {
      const d = futureDateStr(i);
      const dow = new Date(d + "T12:00:00").getDay();
      if (
        closedDays.includes(dow) &&
        !cfg.diasAbiertosExcepcion?.includes(d) &&
        !cfg.diasBloqueados?.includes(d)
      ) {
        testDate = d;
        break;
      }
    }
    if (!testDate) {
      test.skip(true, "No upcoming closed weekday found");
      return;
    }

    const res = await request.post("/api/appointments", {
      data: {
        ...generateTestBookingData(serviceId, serviceDuracion, servicePrecio),
        fecha: testDate,
        hora: "3:00 PM",
      },
    });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j.mensaje).toMatch(/cerrado|disponible/i);
  });

  test("rejects booking outside opening hours — 400", async ({ request }) => {
    // Find an open day and use midnight as the hour
    let testDate = futureDateStr(95);
    for (let i = 95; i < 110; i++) {
      const d = futureDateStr(i);
      const dow = new Date(d + "T12:00:00").getDay();
      const h = cfg.horarioPorDia?.[String(dow)];
      const isException = cfg.diasAbiertosExcepcion?.includes(d);
      if (!isException && (!h || h.cerrado)) continue;
      testDate = d;
      break;
    }

    const res = await request.post("/api/appointments", {
      data: {
        ...generateTestBookingData(serviceId, serviceDuracion, servicePrecio),
        fecha: testDate,
        hora: "12:00 AM", // midnight — before any barbershop opens
      },
    });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j.mensaje).toMatch(/apertura|cierre|horario|disponible/i);
  });
});

test.describe.serial("Business Logic — Conflict + Buffer (WRITES)", () => {
  let serviceId: string;
  let serviceDuracion: number;
  let servicePrecio: number;
  let cfg: Config;
  let conflictTestDate: string;
  let conflictTestHora: string;
  let bufferTestDate: string;
  let conflictApptId: string | null = null;
  let bufferApptId: string | null = null;

  test.beforeAll(async ({ request }) => {
    const [svcRes, cfgRes] = await Promise.all([
      request.get("/api/services"),
      request.get("/api/config"),
    ]);
    const { services } = await svcRes.json();
    const svc = services.find((s: any) => s.activo !== false) ?? services[0];
    serviceId = svc._id;
    serviceDuracion = svc.duracion;
    servicePrecio = svc.precio;
    cfg = (await cfgRes.json()).config ?? {};

    // Find two distinct open days for conflict and buffer tests
    const openDays: string[] = [];
    for (let i = 100; i < 130 && openDays.length < 2; i++) {
      const d = futureDateStr(i);
      const dow = new Date(d + "T12:00:00").getDay();
      const h = cfg.horarioPorDia?.[String(dow)];
      const isException = cfg.diasAbiertosExcepcion?.includes(d);
      if (cfg.diasBloqueados?.includes(d)) continue;
      if (!isException && (!h || h.cerrado)) continue;
      const finMin = (h?.fin ?? 21) * 60;
      if (15 * 60 + serviceDuracion <= finMin) openDays.push(d);
    }

    conflictTestDate = openDays[0] ?? futureDateStr(100);
    bufferTestDate = openDays[1] ?? futureDateStr(101);
    conflictTestHora = "3:00 PM";
  });

  test("conflict — same slot → 409 on second booking", async ({ request }) => {
    const data = {
      ...generateTestBookingData(serviceId, serviceDuracion, servicePrecio),
      fecha: conflictTestDate,
      hora: conflictTestHora,
      clienteNombre: `${TEST_QA_MARKER} Conflict A`,
    };

    const res1 = await request.post("/api/appointments", { data });
    if (res1.status() !== 201) {
      console.log(`[INFO] Conflict test date ${conflictTestDate} not available: ${await res1.text()}`);
      test.skip(true, `Day ${conflictTestDate} not available for booking`);
      return;
    }
    conflictApptId = (await res1.json()).appointment._id;
    console.log(`[CLEANUP] Conflict test appointment: ${conflictApptId}`);

    const res2 = await request.post("/api/appointments", {
      data: { ...data, clienteNombre: `${TEST_QA_MARKER} Conflict B` },
    });
    expect(res2.status()).toBe(409);
    const j = await res2.json();
    expect(j).toHaveProperty("mensaje");
  });

  test("buffer — booking within buffer window → 409", async ({ request }) => {
    const bufferMin = cfg.bufferMinutos ?? 0;
    if (bufferMin === 0) {
      console.log("[INFO] bufferMinutos is 0 — buffer enforcement test skipped");
      test.skip(true, "bufferMinutos is 0 in production config");
      return;
    }

    // Anchor booking at 4:00 PM
    const anchor = {
      ...generateTestBookingData(serviceId, serviceDuracion, servicePrecio),
      fecha: bufferTestDate,
      hora: "4:00 PM",
      clienteNombre: `${TEST_QA_MARKER} Buffer Anchor`,
    };

    const res1 = await request.post("/api/appointments", { data: anchor });
    if (res1.status() !== 201) {
      console.log(`[INFO] Buffer test date ${bufferTestDate} not available: ${await res1.text()}`);
      test.skip(true, `Day ${bufferTestDate} not available for booking`);
      return;
    }
    bufferApptId = (await res1.json()).appointment._id;
    console.log(`[CLEANUP] Buffer anchor appointment: ${bufferApptId}`);

    // Within buffer: 4:00 PM + serviceDuracion minutes later (still inside buffer window)
    const withinBufferMin = 60 * 16 + serviceDuracion; // 4:00 PM offset + duracion
    const wbHour = Math.floor(withinBufferMin / 60);
    const wbMins = withinBufferMin % 60;
    const wbHora = `${wbHour % 12 === 0 ? 12 : wbHour % 12}:${String(wbMins).padStart(2, "0")} ${wbHour < 12 ? "AM" : "PM"}`;

    const res2 = await request.post("/api/appointments", {
      data: {
        ...anchor,
        hora: wbHora,
        clienteNombre: `${TEST_QA_MARKER} Buffer Within`,
      },
    });

    // If the computed time is outside business hours, accept 400 instead of 409
    expect([409, 400]).toContain(res2.status());
    const j = await res2.json();
    expect(j).toHaveProperty("mensaje");
  });
});

test.describe("Occupied Slots — API Structure", () => {
  test("GET /api/appointments/occupied — correct response shape", async ({ request }) => {
    const today = new Date().toISOString().split("T")[0];
    const res = await request.get(`/api/appointments?action=occupied&fecha=${today}`);
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty("horasOcupadas");
    expect(Array.isArray(j.horasOcupadas)).toBe(true);
  });

  test("GET /api/appointments/occupied — no fecha param — handled gracefully", async ({ request }) => {
    const res = await request.get("/api/appointments?action=occupied");
    // Should return 200 with empty/error, not crash the function
    expect([200, 400]).toContain(res.status());
  });
});
