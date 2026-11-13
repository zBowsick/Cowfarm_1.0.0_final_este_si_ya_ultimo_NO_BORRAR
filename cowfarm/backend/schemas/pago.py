from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
 
from .enums import MetodoPago, EstadoPago
 
 
class PagoBase(BaseModel):
    metodo_pago: MetodoPago
    monto: Decimal
 
 
class PagoCreate(PagoBase):
    pedido_id: int
 
 
class PagoUpdate(BaseModel):
    estado: Optional[EstadoPago] = None
 
 
class PagoResponse(PagoBase):
    id: int
    pedido_id: int
    estado: EstadoPago
    fecha_pago: Optional[datetime] = None
 
    model_config = {"from_attributes": True}
 