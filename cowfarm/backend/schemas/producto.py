from pydantic import BaseModel, field_validator
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

from .categoria import CategoriaResponse
from .productoImagen import ProductoImagenResponse
from .validators import validar_texto_seguro

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    stock: int
    unidad_medida: Optional[str] = None
    categoria_id: int

    @field_validator("nombre", "descripcion", "unidad_medida")
    @classmethod
    def _validar_texto(cls, valor: Optional[str]) -> Optional[str]:
        return validar_texto_seguro(valor) if valor is not None else valor

class ProductoCreate(ProductoBase):
    productor_id: int

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = None
    stock: Optional[int] = None
    unidad_medida: Optional[str] = None
    categoria_id: Optional[int] = None

    @field_validator("nombre", "descripcion", "unidad_medida")
    @classmethod
    def _validar_texto(cls, valor: Optional[str]) -> Optional[str]:
        return validar_texto_seguro(valor) if valor is not None else valor

class ProductoResponse(ProductoBase):
    id: int
    productor_id: int
    fecha_creacion: datetime
    imagenes: List[ProductoImagenResponse] = []
    categoria: Optional[CategoriaResponse] = None

    model_config = {"from_attributes": True}
