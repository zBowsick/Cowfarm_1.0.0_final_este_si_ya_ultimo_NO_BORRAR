from pydantic import BaseModel, field_validator


class ProductoImagenBase(BaseModel):
    url_imagen: str

    @field_validator("url_imagen")
    @classmethod
    def _validar_url(cls, valor: str) -> str:
        valor = (valor or "").strip()
        if not valor:
            raise ValueError("La imagen no puede estar vacía.")
        # Se acepta una URL externa o un archivo subido a este servidor.
        if not (
            valor.startswith("http://")
            or valor.startswith("https://")
            or valor.startswith("/uploads/")
        ):
            raise ValueError(
                "La imagen debe ser una URL http(s) o un archivo subido al servidor."
            )
        return valor


class ProductoImagenCreate(ProductoImagenBase):
    producto_id: int


class ProductoImagenResponse(ProductoImagenBase):
    id: int
    producto_id: int

    model_config = {"from_attributes": True}
