// El estado del tema y del tamaño de letra ahora vive en un contexto global
// (src/context/ThemeContext.jsx) para que sea el mismo en todas las páginas.
// Este archivo se mantiene para no romper los imports existentes.
export { useThemeAndFont } from "../context/ThemeContext";
