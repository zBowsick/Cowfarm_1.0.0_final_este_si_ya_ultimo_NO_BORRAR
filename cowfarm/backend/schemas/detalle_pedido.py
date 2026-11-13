from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal

from .producto import ProductoResponse


class DetallePedidoCreate(BaseModel):
    pedido_id: int
    producto_id: int
    categoria_id: int
    cantidad: int = Field(gt=0)


class DetallePedidoUpdate(BaseModel):
    cantidad: int = Field(gt=0)


class DetallePedidoResponse(BaseModel):
    id: int
    pedido_id: int
    producto_id: int
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal
    producto: Optional[ProductoResponse] = None

    model_config = {"from_attributes": True}