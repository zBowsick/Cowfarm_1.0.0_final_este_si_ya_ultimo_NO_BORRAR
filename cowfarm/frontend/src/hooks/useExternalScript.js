import { useEffect, useState } from "react";

// Evita cargar el mismo <script src="..."> dos veces si dos componentes
// usan el hook al mismo tiempo (por ejemplo el panel de "Sign In" y el de
// "Sign Up" en la misma página de login).
const scriptsEnCarga = new Map();

/**
 * Carga un script externo una sola vez y avisa cuándo terminó.
 * Devuelve "idle" | "loading" | "ready" | "error".
 */
export function useExternalScript(src) {
  const [estado, setEstado] = useState(src ? "loading" : "idle");

  useEffect(() => {
    if (!src) return undefined;

    const existente = document.querySelector(`script[src="${src}"]`);
    if (existente && existente.dataset.cargado === "true") {
      setEstado("ready");
      return undefined;
    }

    let promesa = scriptsEnCarga.get(src);
    if (!promesa) {
      promesa = new Promise((resolve, reject) => {
        const script = existente || document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          script.dataset.cargado = "true";
          resolve();
        };
        script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
        if (!existente) document.body.appendChild(script);
      });
      scriptsEnCarga.set(src, promesa);
    }

    let activo = true;
    promesa
      .then(() => activo && setEstado("ready"))
      .catch(() => activo && setEstado("error"));

    return () => {
      activo = false;
    };
  }, [src]);

  return estado;
}
