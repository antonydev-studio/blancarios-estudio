// src/utils/passwordUtils.js
// Utilidades compartidas de contraseña — usadas en registro y recuperación.

/** Regex de validación: mínimo 8 caracteres, una mayúscula, una minúscula y un dígito. */
export const CONTRASENA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/** Mensaje de error estándar para mostrar al usuario. */
export const CONTRASENA_MENSAJE = "Mínimo 8 caracteres, una mayúscula, una minúscula y un número.";

/**
 * Evalúa la fortaleza visual de una contraseña.
 * @param {string} contrasena
 * @returns {{ nivel: 0|1|2|3, etiqueta: string, color: string }}
 *   nivel 0 = vacía, 1 = débil, 2 = media, 3 = fuerte
 *   color = clase de Tailwind para la barra de progreso
 */
export function evaluarFuerza(contrasena) {
  if (!contrasena) return { nivel: 0, etiqueta: "", color: "" };
  let puntos = 0;
  if (contrasena.length >= 8)           puntos++;
  if (/[A-Z]/.test(contrasena))         puntos++;
  if (/[0-9]/.test(contrasena))         puntos++;
  if (/[^A-Za-z0-9]/.test(contrasena)) puntos++;

  if (puntos <= 1) return { nivel: 1, etiqueta: "Débil",  color: "bg-estado-cancelada" };
  if (puntos <= 2) return { nivel: 2, etiqueta: "Media",  color: "bg-estado-pendiente" };
  return              { nivel: 3, etiqueta: "Fuerte", color: "bg-estado-confirmada" };
}
