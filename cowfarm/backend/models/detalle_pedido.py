from sqlalchemy import (
    Column, Integer,  DECIMAL,  ForeignKey, 
)
from sqlalchemy.orm import relationship
from core.database import Base



class DetallePedido(Base):
    __tablename__ = "detalle_pedido"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(DECIMAL(12, 2), nullable=False)
    subtotal = Column(DECIMAL(12, 2), nullable=False)

    pedido = relationship("Pedido", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles_pedido")