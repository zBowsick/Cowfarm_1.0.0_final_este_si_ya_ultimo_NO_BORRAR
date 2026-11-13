import re
import unicodedata

from pydantic import BaseModel, field_validator
from typing import Optional

from .validators import validar_texto_seguro


def generar_slug(texto: str) -> str:
    """Convierte 'Frutas Frescas del Huila' en 'frutas-frescas-del-huila'."""
    texto = unicodedata.normalize("NFD", texto or "")
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    texto = re.sub(r"[^a-zA-Z0-9]+", "-", texto).strip("-").lower()
    return texto or "categoria"


class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None

    @field_validator("nombre", "descripcion")
    @classmethod
    def _validar_texto(cls, valor: Optional[str]) -> Optional[str]:
        return validar_texto_seguro(valor) if valor is not None else valor

    @field_validator("imagen_url")
    @classmethod
    def _validar_imagen(cls, valor: Optional[str]) -> Optional[str]:
        if valor is None or valor.strip() == "":
            return None
        valor = valor.strip()
        # Se aceptan URLs externas o rutas internas subidas al servidor.
        if not (valor.startswith("http://") or valor.startswith("https://") or valor.startswith("/uploads/")):
            raise ValueError("La imagen debe ser una URL http(s) o un archivo subido al servidor.")
        return valor


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None

    @field_validator("nombre", "descripcion")
    @classmethod
    def _validar_texto(cls, valor: Optional[str]) -> Optional[str]:
        return validar_texto_seguro(valor) if valor is not None else valor

    @field_validator("imagen_url")
    @classmethod
    def _validar_imagen(cls, valor: Optional[str]) -> Optional[str]:
        if valor is None:
            return None
        if valor.strip() == "":
            return ""  # cadena vacía = quitar la imagen
        valor = valor.strip()
        if not (valor.startswith("http://") or valor.startswith("https://") or valor.startswith("/uploads/")):
            raise ValueError("La imagen debe ser una URL http(s) o un archivo subido al servidor.")
        return valor


class CategoriaResponse(CategoriaBase):
    id: int
    slug: Optional[str] = None
    total_productos: Optional[int] = None

    model_config = {"from_attributes": True}
