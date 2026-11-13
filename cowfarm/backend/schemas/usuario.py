from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
 
from .enums import RolUsuario
from .direccion import DireccionResponse
from .validators import validar_texto_seguro
 
 
class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    telefono: Optional[str] = None
    rol: RolUsuario

    @field_validator("nombre", "apellido")
    @classmethod
    def _validar_texto(cls, valor: str) -> str:
        return validar_texto_seguro(valor)
 
 
class UsuarioCreate(UsuarioBase):
    password: str
 
 
class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    password: Optional[str] = None

    @field_validator("nombre", "apellido")
    @classmethod
    def _validar_texto(cls, valor: Optional[str]) -> Optional[str]:
        return validar_texto_seguro(valor) if valor is not None else valor
 
 
class UsuarioResponse(UsuarioBase):
    id: int
    fecha_registro: datetime
    direcciones: List[DireccionResponse] = []
 
    model_config = {"from_attributes": True}


class UsuarioRolUpdate(BaseModel):
    rol: RolUsuario

