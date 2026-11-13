import { useThemeAndFont } from "../context/ThemeContext";

/**
 * Panel flotante de accesibilidad: agrandar / reducir / restablecer la letra
 * y cambiar entre modo claro y oscuro.
 */
export default function FontControls() {
  const {
    dark,
    toggleDark,
    changeFontSize,
    resetFontSize,
    porcentaje,
    puedeAumentar,
    puedeReducir,
    esTamanoBase,
  } = useThemeAndFont();

  return (
    <div className="font-controls" role="group" aria-label="Accesibilidad">
      <button
        type="button"
        className="fc-btn"
        onClick={() => changeFontSize(1)}
        disabled={!puedeAumentar}
        title="Agrandar la letra"
        aria-label="Agrandar el tamaño de la letra"
      >
        A+
      </button>

      <button
        type="button"
        className="fc-btn"
        onClick={() => changeFontSize(-1)}
        disabled={!puedeReducir}
        title="Reducir la letra"
        aria-label="Reducir el tamaño de la letra"
      >
        A-
      </button>

      <button
        type="button"
        className="fc-btn"
        onClick={resetFontSize}
        disabled={esTamanoBase}
        title="Restablecer el tamaño original"
        aria-label="Restablecer el tamaño de la letra"
      >
        R
      </button>

      <span className="fc-nivel" aria-live="polite">
        {porcentaje}%
      </span>

      <button
        type="button"
        id="dark-mode-toggle"
        className="fc-btn btn-toggle"
        onClick={toggleDark}
        title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
        aria-pressed={dark}
      >
        <span className="icon sun" aria-hidden="true">☀️</span>
        <span className="icon moon" aria-hidden="true">🌑</span>
      </button>
    </div>
  );
}
