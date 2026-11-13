import { useEffect } from "react";

// El sitio original era HTML estático: cada página cargaba SOLO su propio
// CSS (styles-home.css, styles-nosotros.css, etc.) además de GIC.css.
// En una SPA de React, si esos CSS se importan normalmente (import "./x.css"
// dentro de cada componente), Vite los junta TODOS en un único archivo que
// queda activo siempre, en todas las páginas — y como varios de esos
// archivos reutilizan los mismos nombres de clase (".container", "body",
// "header"...) para cosas distintas, terminan pisándose entre sí.
//
// Este hook agrega un <link> al <head> cuando el componente se monta y lo
// quita cuando se desmonta, para que solo haya una hoja de estilos de
// página activa a la vez — igual que en el sitio original.
//
// `bodyClass` (opcional) agrega una clase al <body> mientras la página está
// montada. Varias hojas definen reglas como `body.admin-body { ... }` que
// antes nunca se aplicaban porque nadie ponía esa clase.
export function usePageStyle(href, bodyClass) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [href]);

  useEffect(() => {
    if (!bodyClass) return undefined;
    document.body.classList.add(bodyClass);
    return () => {
      document.body.classList.remove(bodyClass);
    };
  }, [bodyClass]);
}
