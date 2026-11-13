from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
 
 
class VentaBase(BaseModel):
    valor_total: Decimal
 
 
class VentaCreate(VentaBase):
    pedido_id: int
 
 
class VentaResponse(VentaBase):
    id: int
    pedido_id: int
    fecha_venta: datetime
 
    model_config = {"from_attributes": True}
 