import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * ThemeContext — modo claro/oscuro + tamaño de letra, compartidos por TODA la app.
 *
 * Antes cada página creaba su propio estado con useThemeAndFont(), así que:
 *   - En las páginas sin <FontControls> (Panel Admin, Mi cuenta) el modo
 *     oscuro nunca se aplicaba y se "perdía" al navegar.
 *   - El tamaño de letra se guardaba, pero se aplicaba a `body`, y como casi
 *     todo el sitio usa `rem` (que depende de `html`, no de `body`), los
 *     botones A+ / A- no cambiaban nada visible.
 *
 * Ahora el estado vive en un solo lugar, se aplica sobre <html> y se guarda
 * en localStorage.
 */

const CLAVE_TEMA = "theme";
const CLAVE_ESCALA = "fontScale";

export const ESCALA_BASE = 1;
export const ESCALA_MIN = 0.8; // 80 %
export const ESCALA_MAX = 1.6; // 160 %
const PASO = 0.1; // 10 % por clic

const ThemeContext = createContext(null);

function redondear(valor) {
  // Evita los 0.7999999999 del punto flotante
  return Math.round(valor * 100) / 100;
}

function limitar(valor) {
  return redondear(Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, valor)));
}

function leerTemaGuardado() {
  try {
    const guardado = localStorage.getItem(CLAVE_TEMA);
    if (guardado === "dark") return true;
    if (guardado === "light") return false;
    // Sin preferencia guardada: se respeta la del sistema operativo.
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  } catch {
    return false;
  }
}

function leerEscalaGuardada() {
  try {
    const guardada = parseFloat(localStorage.getItem(CLAVE_ESCALA));
    if (!Number.isFinite(guardada)) return ESCALA_BASE;
    // Compatibilidad con la versión anterior, que guardaba píxeles (ej. "18")
    if (guardada > 4) return limitar(guardada / 16);
    return limitar(guardada);
  } catch {
    return ESCALA_BASE;
  }
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(leerTemaGuardado);
  const [escala, setEscala] = useState(leerEscalaGuardada);

  // --- Modo oscuro ---
  useEffect(() => {
    document.body.classList.toggle("dark-mode", dark);
    // Hace que los controles nativos (inputs, scrollbars) acompañen el tema
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    try {
      localStorage.setItem(CLAVE_TEMA, dark ? "dark" : "light");
    } catch {
      /* modo privado del navegador: no pasa nada */
    }
  }, [dark]);

  // --- Tamaño de letra ---
  // Se aplica a <html>, que es de donde cuelgan todas las medidas en `rem`.
  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(escala));
    // Se mantiene también la variable antigua por si alguna hoja la usa.
    document.documentElement.style.setProperty(
      "--base-font-size",
      `${redondear(16 * escala)}px`
    );
    try {
      localStorage.setItem(CLAVE_ESCALA, String(escala));
    } catch {
      /* ignorado */
    }
  }, [escala]);

  const toggleDark = useCallback((e) => {
    if (e?.preventDefault) e.preventDefault();
    setDark((prev) => !prev);
  }, []);

  /** direccion = 1 para agrandar, -1 para reducir. */
  const changeFontSize = useCallback((direccion) => {
    setEscala((prev) => limitar(prev + direccion * PASO));
  }, []);

  const resetFontSize = useCallback(() => setEscala(ESCALA_BASE), []);

  const valor = useMemo(
    () => ({
      dark,
      setDark,
      toggleDark,
      escala,
      porcentaje: Math.round(escala * 100),
      puedeAumentar: escala < ESCALA_MAX,
      puedeReducir: escala > ESCALA_MIN,
      esTamanoBase: escala === ESCALA_BASE,
      changeFontSize,
      resetFontSize,
    }),
    [dark, escala, toggleDark, changeFontSize, resetFontSize]
  );

  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>;
}

export function useThemeAndFont() {
  const contexto = useContext(ThemeContext);
  if (!contexto) {
    throw new Error("useThemeAndFont debe usarse dentro de <ThemeProvider>.");
  }
  return contexto;
}
