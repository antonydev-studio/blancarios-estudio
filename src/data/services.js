// src/data/servicios.js
//
// TEMPORAL: usando imágenes de Unsplash hasta tener fotos reales.
// Cuando tengas las fotos de la barbería:
//   1. Ponlas en src/assets/
//   2. Reemplaza las URLs por: import corteImg from "../assets/servicio-corte.jpg"
//   3. Cambia imagen: corteImg
// El resto del proyecto no cambia.

/** @type {Array} */
export const SERVICIOS = [
  {
    id:          "corte",
    titulo:      "Corte de Cabello Clásico",
    descripcion: "Un corte atemporal adaptado a tu estilo personal.",
    // Tijeras profesionales, tonalidad fría oscura — combina con el fondo #111010
    imagen:      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80",
    precio:      25,
    duracion:    30,
  },
  {
    id:          "barba",
    titulo:      "Recorte y Perfilado de Barba",
    descripcion: "Cuidado de precisión para un look nítido y limpio.",
    // Perfilado de barba con navaja — encuadre oscuro y detallado
    imagen:      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
    precio:      30,
    duracion:    45,
  },
  {
    id:          "limpieza-facial",
    titulo:      "Limpieza Facial Profunda",
    descripcion: "Purifica y revitaliza tu piel con una limpieza profesional a fondo.",
    // Ritual de cuidado de piel, tonos neutros y cálidos
    imagen:      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80&sat=-20",
    precio:      35,
    duracion:    45,
  },
];

export const RAZONES = [
  {
    id:     "expertos",
    titulo: "Barbero Experto",
    texto:  "Dedicado a su oficio con años de experiencia.",
  },
  {
    id:     "productos",
    titulo: "Productos Premium",
    texto:  "Selección de productos para resultados superiores.",
  },
  {
    id:     "ambiente",
    titulo: "Ambiente Relajante",
    texto:  "Un espacio cómodo y acogedor diseñado para que te desconectes.",
  },
];