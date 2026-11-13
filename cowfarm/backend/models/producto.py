from sqlalchemy import Column, Integer, String, Text, DECIMAL, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import relationship
from core.database import Base

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    productor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(DECIMAL(12, 2), nullable=False)
    stock = Column(Integer, nullable=False)
    unidad_medida = Column(String(50), nullable=True)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())

    productor = relationship("Usuario", back_populates="productos")
    categoria = relationship("Categoria", back_populates="productos")
    imagenes = relationship("ProductoImagen", back_populates="producto", cascade="all, delete-orphan")
    detalles_pedido = relationship("DetallePedido", back_populates="producto")
