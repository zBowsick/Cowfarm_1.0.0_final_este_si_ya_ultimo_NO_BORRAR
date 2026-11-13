from sqlalchemy import (
    Column, Integer,   DECIMAL, TIMESTAMP, Enum, ForeignKey, func
)
from sqlalchemy.orm import relationship
from core.database import Base



class Pago(Base):
    __tablename__ = "pagos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    metodo_pago = Column(
        Enum("EFECTIVO", "NEQUI", "DAVIPLATA", "TRANSFERENCIA", "TARJETA", name="metodo_pago"),
        nullable=False
    )
    monto = Column(DECIMAL(12, 2), nullable=False)
    estado = Column(
        Enum("PENDIENTE", "PAGADO", "RECHAZADO", name="estado_pago"),
        nullable=False, default="PENDIENTE"
    )
    fecha_pago = Column(TIMESTAMP, server_default=func.now())

    pedido = relationship("Pedido", back_populates="pagos")
