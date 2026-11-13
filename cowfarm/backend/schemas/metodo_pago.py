from pydantic import BaseModel, field_validator
from typing import Optional

from .validators import validar_texto_seguro


class MetodoPagoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    activo: bool = True

    @field_validator("nombre", "descripcion")
    @classmethod
    def _validar_texto(cls, valor: Optional[str]) -> Optional[str]:
        return validar_texto_seguro(valor) if valor is not None else valor


class MetodoPagoCreate(MetodoPagoBase):
    pass


class MetodoPagoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    activo: Optional[bool] = None

    @field_validator("nombre", "descripcion")
    @classmethod
    def _validar_texto(cls, valor: Optional[str]) -> Optional[str]:
        return validar_texto_seguro(valor) if valor is not None else valor


class MetodoPagoResponse(MetodoPagoBase):
    id: int

    model_config = {"from_attributes": True}
