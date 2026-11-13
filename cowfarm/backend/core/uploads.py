"""
core/uploads.py — Utilidades para recibir archivos (imágenes) desde el
navegador o el celular y guardarlos en disco de forma segura.

Los archivos quedan en la carpeta `uploads/` del backend y se sirven como
archivos estáticos en la ruta /uploads (ver main.py). En la base de datos
solo se guarda la ruta relativa, por ejemplo:

    /uploads/productos/8f3c1b9a2e.jpg

Así, si mañana cambias el dominio del backend, las imágenes siguen
funcionando sin tocar la base de datos.
"""

import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

# Carpeta raíz donde se guardan todos los archivos subidos.
# Queda al lado de main.py: <proyecto>/uploads/
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_ROOT = BASE_DIR / "uploads"
URL_PREFIX = "/uploads"

# Solo imágenes. Nada de .exe, .php, .svg (el SVG puede traer scripts).
EXTENSIONES_PERMITIDAS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
MIMES_PERMITIDOS = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
}

# Las fotos de celular pesan bastante; 8 MB es un límite cómodo.
MAX_BYTES = 8 * 1024 * 1024

# Firmas (magic numbers) para confirmar que el archivo es realmente una imagen
# y no un ejecutable con el nombre cambiado a .jpg
FIRMAS_IMAGEN = (
    b"\xff\xd8\xff",          # JPEG
    b"\x89PNG\r\n\x1a\n",     # PNG
    b"GIF87a",                # GIF
    b"GIF89a",                # GIF
)


def _es_imagen_real(contenido: bytes) -> bool:
    """Revisa los primeros bytes del archivo para confirmar que es una imagen."""
    if contenido.startswith(FIRMAS_IMAGEN):
        return True
    # WEBP y AVIF usan contenedor RIFF / ISO-BMFF
    if contenido[:4] == b"RIFF" and contenido[8:12] == b"WEBP":
        return True
    if contenido[4:12] in (b"ftypavif", b"ftypavis"):
        return True
    return False


def guardar_imagen(archivo: UploadFile, subcarpeta: str = "productos") -> str:
    """
    Valida y guarda una imagen subida. Devuelve la URL relativa lista para
    guardar en la base de datos (ej. "/uploads/productos/abc123.jpg").

    Lanza HTTPException 400 / 413 si el archivo no es válido.
    """
    if archivo is None or not archivo.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se recibió ningún archivo.",
        )

    extension = os.path.splitext(archivo.filename)[1].lower()
    if extension not in EXTENSIONES_PERMITIDAS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Formato no permitido. Usa una imagen JPG, PNG, WEBP, GIF o AVIF."
            ),
        )

    if archivo.content_type and archivo.content_type.lower() not in MIMES_PERMITIDOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido: {archivo.content_type}",
        )

    contenido = archivo.file.read()

    if len(contenido) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo está vacío.",
        )

    if len(contenido) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"La imagen supera el límite de {MAX_BYTES // (1024 * 1024)} MB.",
        )

    if not _es_imagen_real(contenido):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo no parece ser una imagen válida.",
        )

    # Nombre aleatorio: evita colisiones y evita que alguien controle la ruta.
    nombre_final = f"{uuid.uuid4().hex}{extension}"
    carpeta_destino = UPLOAD_ROOT / subcarpeta
    carpeta_destino.mkdir(parents=True, exist_ok=True)

    with open(carpeta_destino / nombre_final, "wb") as destino:
        destino.write(contenido)

    return f"{URL_PREFIX}/{subcarpeta}/{nombre_final}"


def eliminar_imagen(url_relativa: str) -> None:
    """
    Borra del disco un archivo que subimos nosotros. Si la URL es externa
    (http://...) o el archivo ya no existe, simplemente no hace nada.
    """
    if not url_relativa or not url_relativa.startswith(f"{URL_PREFIX}/"):
        return
    try:
        relativa = url_relativa[len(URL_PREFIX) + 1:]
        ruta = (UPLOAD_ROOT / relativa).resolve()
        # Blindaje contra path traversal: la ruta debe seguir dentro de uploads/
        if ruta.is_file() and str(ruta).startswith(str(UPLOAD_ROOT.resolve())):
            ruta.unlink()
    except OSError:
        pass
