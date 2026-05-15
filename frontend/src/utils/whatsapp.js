export function generarMensajeCita(nombre, hora) {
  return `Hola ${nombre} 👋\n\nSolo para confirmar tu cita de hoy a las ${hora}.\n\nLo ideal es llegar unos minutos antes para evitar retrasos.\n\nEn caso de no poder asistir, por favor cancela o reagenda con al menos 3 horas de anticipación.`;
}

export function generarWaUrl(telefono, mensaje) {
  let n = String(telefono).replace(/\D/g, "");
  if (n.length === 10) n = `52${n}`;

  return `https://wa.me/${n}?text=${encodeURIComponent(mensaje)}`;
}