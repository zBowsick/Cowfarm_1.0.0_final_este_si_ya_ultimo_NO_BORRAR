import re

PATRON_PELIGROSO = re.compile(r"<[^>]*>|javascript:|onerror|onload|onclick", re.IGNORECASE)


def validar_texto_seguro(valor: str) -> str:
    """
    Validador perimetral anti-XSS. Si el texto contiene etiquetas HTML/JS
    o atributos de eventos peligrosos, rechaza la petición en la frontera
    de la API antes de que el dato llegue a la base de datos.
    """
    if valor is None:
        return valor
    if PATRON_PELIGROSO.search(valor):
        raise ValueError("❌ VALIDACIÓN BLOQUEADA: No se permiten caracteres de scripting o HTML.")
    return valor.strip()
