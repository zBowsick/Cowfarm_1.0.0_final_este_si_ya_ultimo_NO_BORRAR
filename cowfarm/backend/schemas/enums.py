from enum import Enum
 
 
class RolUsuario(str, Enum):
    VENDEDOR = "vendedor"
    COMPRADOR = "comprador"
    ADMINISTRADOR = "administrador"
    DISTRIBUIDOR = "distribuidor"

 
 
class MetodoPago(str, Enum):
    EFECTIVO = "EFECTIVO"
    NEQUI = "NEQUI"
    DAVIPLATA = "DAVIPLATA"
    TRANSFERENCIA = "TRANSFERENCIA"
    TARJETA = "TARJETA"
 
 
class EstadoPago(str, Enum):
    PENDIENTE = "PENDIENTE"
    PAGADO = "PAGADO"
    RECHAZADO = "RECHAZADO"
 
 
class EstadoPedido(str, Enum):
    PENDIENTE = "PENDIENTE"
    ACEPTADO = "ACEPTADO"
    EN_PREPARACION = "EN_PREPARACION"
    EN_CAMINO = "EN_CAMINO"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"
 