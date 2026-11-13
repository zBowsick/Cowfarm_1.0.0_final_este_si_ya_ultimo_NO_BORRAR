from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional

from .validators import validar_texto_seguro


class ProveedorBase(BaseModel):
    nombre: str
    tipo_suministro: Optional[str] = None
    contacto_nombre: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    activo: bool = True

    @field_validator("nombre", "tipo_suministro", "contacto_nombre", "direccion")
    @classmethod
    def _validar_texto(cls, valor: Optional[str]) -> Optional[str]:
        return validar_texto_seguro(valor) if valor is not None else valor


class ProveedorCreate(ProveedorBase):
    pass


class ProveedorUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo_suministro: Optional[str] = None
    contacto_nombre: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    activo: Optional[bool] = None

    @field_validator("nombre", "tipo_suministro", "contacto_nombre", "direccion")
    @classmethod
    def _validar_texto(cls, valor: Optional[str]) -> Optional[str]:
        return validar_texto_seguro(valor) if valor is not None else valor


class ProveedorResponse(ProveedorBase):
    id: int

    model_config = {"from_attributes": True}
