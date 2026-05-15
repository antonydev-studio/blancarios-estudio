// src/hooks/useHomepageContent.js
//
// Hook de solo-lectura usado por HomePage para obtener el contenido
// de la página principal desde el backend (GET /api/config).
// Las escrituras se hacen desde HomepageSection (panel admin).

import { useState, useEffect } from "react";
import { SERVICIOS, RAZONES } from "../data/services";

const HERO_DEFAULT =
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1400&q=80";

export function useHomepageContent() {
  const [cargando,  setCargando]  = useState(true);
  const [heroImg,   setHeroImg]   = useState(HERO_DEFAULT);
  const [servicios, setServicios] = useState(SERVICIOS);
  const [razones,   setRazones]   = useState(RAZONES);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(({ config = {} }) => {
        if (config.heroImagen)            setHeroImg(config.heroImagen);
        if (config.serviciosHome?.length) setServicios(config.serviciosHome);
        if (config.razonesHome?.length)   setRazones(config.razonesHome);
      })
      .catch(() => {}) // mantener defaults si falla
      .finally(() => setCargando(false));
  }, []);

  return { cargando, heroImg, servicios, razones };
}
