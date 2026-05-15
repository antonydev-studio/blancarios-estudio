// All data here is intentionally fake and clearly labeled.
// Never use real user data, real emails, or real phone numbers in tests.

export const TEST_USER = {
  nombre: "TEST Playwright E2E",
  telefono: "7550000001",
  correo: "playwright-e2e@example.invalid",
} as const;

// Wrong credentials — used only to verify error state in login/auth flows.
export const INVALID_CREDENTIALS = {
  correo: "no-existe-playwright@example.invalid",
  contrasena: "InvalidPass999!",
} as const;

// Wrong admin credentials — used only to verify admin login error handling.
export const INVALID_ADMIN_CREDENTIALS = {
  correo: "admin-playwright-invalid@example.invalid",
  contrasena: "WrongAdminPass999!",
} as const;

// Invalid form inputs — used to trigger client-side validation errors.
export const INVALID_FORM_INPUTS = {
  correoMalFormato: "not-an-email",
  telefonoCorto: "12345",
  contrasenaDebil: "weak",
} as const;
