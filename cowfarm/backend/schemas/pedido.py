from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

from .enums import EstadoPedido
from .detalle_pedido import DetallePedidoResponse
from .pago import PagoResponse
from .venta import VentaResponse


class PedidoItemCreate(BaseModel):
    """Un producto + cantidad a incluir en el pedido. categoria_id debe
    coincidir con la categoría real del producto (se valida en el servidor).
    El precio y el subtotal se calculan automáticamente."""
    producto_id: int
    categoria_id: int
    cantidad: int = Field(gt=0)


class PedidoCreate(BaseModel):
    comprador_id: int
    items: List[PedidoItemCreate] = []  # opcional: puedes crear el pedido vacío y agregar después

    model_config = {
        "json_schema_extra": {
            "example": {
                "comprador_id": 1,
                "items": [
                    {"producto_id": 3, "categoria_id": 2, "cantidad": 2}
                ],
            }
        }
    }


class PedidoUpdate(BaseModel):
    estado: Optional[EstadoPedido] = None
    total: Optional[Decimal] = None


class PedidoDistribuidorUpdate(BaseModel):
    """RF24: el administrador reasigna qué distribuidor queda a cargo del pedido."""
    distribuidor_id: int


class PedidoResponse(BaseModel):
    id: int
    comprador_id: int
    distribuidor_id: Optional[int] = None
    total: Decimal
    fecha_pedido: datetime
    estado: EstadoPedido
    # Datos para la entrega (solo lectura)
    comprador_nombre: Optional[str] = None
    comprador_telefono: Optional[str] = None
    direccion_entrega: Optional[str] = None
    # PAGADO | EFECTIVO (cobrar al entregar) | PENDIENTE | SIN_PAGO
    pago_estado: str = "SIN_PAGO"
    pago_metodo: Optional[str] = None
    detalles: List[DetallePedidoResponse] = []
    pagos: List[PagoResponse] = []
    venta: Optional[VentaResponse] = None

    model_config = {"from_attributes": True}


class PedidoCreadoResponse(BaseModel):
    """Respuesta simple al crear un pedido. Para ver el detalle completo
    (productos, categorías, precios) usa GET /detalle-pedido/pedido/{pedido_id}."""
    mensaje: str = "Pedido creado exitosamente"
    pedido_id: int
    total: Decimal

    model_config = {"from_attributes": True}