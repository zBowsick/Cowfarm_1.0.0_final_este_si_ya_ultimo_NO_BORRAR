from sqlalchemy import Column, Integer,  DECIMAL, TIMESTAMP,  ForeignKey, func
from sqlalchemy.orm import relationship
from core.database import Base


class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False, unique=True)
    fecha_venta = Column(TIMESTAMP, server_default=func.now())
    valor_total = Column(DECIMAL(12, 2), nullable=False)

    pedido = relationship("Pedido", back_populates="venta")