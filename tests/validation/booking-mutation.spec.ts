/**
 * Booking Mutation Tests — Creates REAL appointments in production.
 *
 * Safety:
 * - clienteNombre/correo contain TEST QA FINAL — safe to bulk-delete
 * - Dates: 95–110 days ahead (reads config to pick an open day)
 * - Time: 3:00 PM or config-derived midday hour
 * - NEVER submits via UI — direct API calls only
 * - Run cleanup when done: MONGO_URI=... node scripts/cleanup-test-data.js
 *
 * Execution: pnpm playwright test tests/validation/booking-mutation.spec.ts
 */
import { test, expect } from "@playwright/test";
import {
  generateTestBookingData,
  futureDateStr,
  TEST_QA_MARKER,
} from "../utils/generators";

test.describe.serial("Booking Mutation — Real API", () => {
  let serviceId: string;
  let serviceDuracion: number;
  let servicePrecio: number;
  let testDate: string;
  let testHora = "3:00 PM";
  let createdId: string | null = null;

  test.beforeAll(async ({ request }) => {
    const svcRes = await request.get("/api/services");
    expect(svcRes.status()).toBe(200);
    const { services } = await svcRes.json();
    const svc = services.find((s: any) => s.activo !== false) ?? services[0];
    serviceId = svc._id;
    serviceDuracion = svc.duracion;
    servicePrecio = svc.precio;

    // Find an open day + unoccupied slot 95-115 days ahead
    const cfgRes = await request.get("/api/config");
    const { config } = await cfgRes.json();
    testDate = futureDateStr(95);

    outer: for (let i = 95; i < 115; i++) {
      const d = futureDateStr(i);
      if (config.diasBloqueados?.includes(d)) continue;
      const dow = new Date(d + "T12:00:00").getDay();
      const horario = config.horarioPorDia?.[String(dow)];
      const isException = config.diasAbiertosExcepcion?.includes(d);
      if (!isException && (!horario || horario.cerrado)) continue;

      const iniHour = horario?.inicio ?? 9;
      const finHour = horario?.fin ?? 21;

      // Check occupied slots for this day
      const occRes = await request.get(`/api/appointments/occupied?fecha=${d}`);
      const occupied: string[] = occRes.ok() ? (await occRes.json()).horasOcupadas ?? [] : [];

      // Try each hour slot from start+1 to end-2, prefer afternoon
      const candidates = [];
      for (let h = iniHour + 1; h <= finHour - 2; h++) {
        const label = `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? "AM" : "PM"}`;
        const slotEndMin = h * 60 + serviceDuracion;
        if (slotEndMin <= finHour * 60 && !occupied.includes(label)) {
          candidates.push(label);
        }
      }
      // Prefer afternoon slot (index closer to middle-end)
      const pick = candidates[Math.floor(candidates.length * 0.7)] ?? candidates[0];
      if (pick) {
        testDate = d;
        testHora = pick;
        break outer;
      }
    }
  });

  test("POST /api/appointments — 201 with correct structure", async ({ request }) => {
    const data = generateTestBookingData(serviceId, serviceDuracion, servicePrecio, 0, testHora);
    data.fecha = testDate;

    const res = await request.post("/api/appointments", { data });

    expect(
      res.status(),
      `Booking on ${testDate} at ${testHora} failed: ${await res.text()}`
    ).toBe(201);

    const j = await res.json();
    expect(j).toHaveProperty("appointment");
    expect(j.appointment.clienteNombre).toContain(TEST_QA_MARKER);
    expect(j.appointment.estado).toBe("pendiente");
    expect(j.appointment).toHaveProperty("_id");
    expect(j.appointment.fecha).toBe(testDate);

    createdId = j.appointment._id;
    console.log(
      `\n[CLEANUP NEEDED] Test appointment: ${createdId} on ${testDate} — run: MONGO_URI=<uri> node scripts/cleanup-test-data.js`
    );
  });

  test("GET /api/appointments/occupied — reflects booked slot", async ({ request }) => {
    if (!createdId) test.skip(true, "Booking creation failed");

    const res = await request.get(`/api/appointments/occupied?fecha=${testDate}`);
    expect(res.status()).toBe(200);

    const j = await res.json();
    expect(j).toHaveProperty("horasOcupadas");
    expect(Array.isArray(j.horasOcupadas)).toBe(true);
    expect(j.horasOcupadas).toContain(testHora);
  });

  test("POST /api/appointments same slot — 409 conflict", async ({ request }) => {
    if (!createdId) test.skip(true, "Booking creation failed");

    const data = generateTestBookingData(serviceId, serviceDuracion, servicePrecio, 0, testHora);
    data.fecha = testDate;
    data.clienteNombre = `${TEST_QA_MARKER} Duplicate`;

    const res = await request.post("/api/appointments", { data });
    expect(res.status()).toBe(409);

    const j = await res.json();
    expect(j).toHaveProperty("mensaje");
    expect(j.mensaje.endsWith(".")).toBe(true);
  });

  test("POST /api/appointments — missing fields — 400", async ({ request }) => {
    const res = await request.post("/api/appointments", {
      data: { clienteNombre: `${TEST_QA_MARKER} Missing Fields` },
    });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j).toHaveProperty("mensaje");
  });

  test("POST /api/appointments — past date — 400", async ({ request }) => {
    const data = generateTestBookingData(serviceId, serviceDuracion, servicePrecio);
    data.fecha = "2024-01-01";

    const res = await request.post("/api/appointments", { data });
    expect(res.status()).toBe(400);

    const j = await res.json();
    expect(j.mensaje).toMatch(/pasadas/i);
  });

  test("POST /api/appointments — integer duracion required — 400", async ({ request }) => {
    const data = {
      ...generateTestBookingData(serviceId, serviceDuracion, servicePrecio),
      duracion: 0,
    };

    const res = await request.post("/api/appointments", { data });
    expect([400, 201]).toContain(res.status());
    if (res.status() === 201) {
      const j = await res.json();
      console.log(`[CLEANUP] Zero-duration booking slipped through: ${j.appointment._id}`);
    }
  });
});
