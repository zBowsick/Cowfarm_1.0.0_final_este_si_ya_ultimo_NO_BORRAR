from pydantic import BaseModel, EmailStr, field_validator

from .validators import validar_texto_seguro


class ContactoCreate(BaseModel):
    nombre: str
    email: EmailStr
    mensaje: str

    @field_validator("nombre", "mensaje")
    @classmethod
    def _validar_texto(cls, valor: str) -> str:
        return validar_texto_seguro(valor)
