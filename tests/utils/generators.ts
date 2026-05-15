export const TEST_QA_MARKER = "TEST QA FINAL";

const BASE_FUTURE_DAYS = 95;

export function futureDateStr(daysAhead: number = BASE_FUTURE_DAYS): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

export function generateTestBookingData(
  serviceId: string,
  duracion: number = 30,
  precio: number = 0,
  daysAhead: number = BASE_FUTURE_DAYS,
  hora: string = "3:00 PM"
) {
  return {
    clienteNombre: `${TEST_QA_MARKER} Playwright`,
    clienteTelefono: "7550000099",
    clienteCorreo: "playwright-validation@example.invalid",
    servicios: [serviceId],
    fecha: futureDateStr(daysAhead),
    hora,
    duracion,
    precio,
  };
}

export function generateTestUserData() {
  const ts = Date.now();
  return {
    nombre: `${TEST_QA_MARKER} User ${ts}`,
    telefono: `755${String(ts).slice(-7)}`,
    correo: `playwright-test-${ts}@example.invalid`,
    contrasena: "TestPass123!",
  };
}

export function generateTestServiceData() {
  return {
    titulo: `${TEST_QA_MARKER} Service`,
    descripcion: "Automated validation service — safe to delete",
    precio: 1,
    duracion: 15,
    categoria: "TEST",
    activo: false,
  };
}
