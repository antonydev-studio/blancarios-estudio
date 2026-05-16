// Shared frontend constants.
// WhatsApp contact URL — set VITE_WHATSAPP_URL in your .env to override at build time.
export const WHATSAPP_URL =
  import.meta.env.VITE_WHATSAPP_URL ??
  "https://wa.me/527551313518?text=Hola%2C%20me%20contacto%20desde%20la%20p%C3%A1gina%20oficial%20y%20tengo%20una%20duda%20sobre%20mi%20cita.";
