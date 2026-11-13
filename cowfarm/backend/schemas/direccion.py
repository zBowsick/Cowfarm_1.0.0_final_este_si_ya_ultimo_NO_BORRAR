from pydantic import BaseModel, field_validator
from typing import Optional

from .validators import validar_texto_seguro
 
 
class DireccionBase(BaseModel):
    departamento: str
    municipio: str
    vereda: Optional[str] = None
    direccion: Optional[str] = None

    @field_validator("departamento", "municipio", "vereda", "direccion")
    @classmethod
    def _validar_texto(cls, valor: Optional[str]) -> Optional[str]:
        return validar_texto_seguro(valor) if valor is not None else valor
 
 
class DireccionCreate(DireccionBase):
    usuario_id: int
 
 
class DireccionUpdate(BaseModel):
    departamento: Optional[str] = None
    municipio: Optional[str] = None
    vereda: Optional[str] = None
    direccion: Optional[str] = None

    @field_validator("departamento", "municipio", "vereda", "direccion")
    @classmethod
    def _validar_texto(cls, valor: Optional[str]) -> Optional[str]:
        return validar_texto_seguro(valor) if valor is not None else valor
 
 
class DireccionResponse(DireccionBase):
    id: int
    usuario_id: int
 
    model_config = {"from_attributes": True}
