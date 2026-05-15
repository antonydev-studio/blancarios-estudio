// backend/src/utils/validators.js
// Expresiones regulares de validación compartidas entre controladores.

/** Contraseña: mínimo 8 caracteres, una mayúscula, una minúscula y un dígito. */
export const CONTRASENA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/** Correo electrónico: formato básico sin espacios ni @ dobles. */
export const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
