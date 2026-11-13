from sqlalchemy import Column, Integer, String,  ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class ProductoImagen(Base):
    __tablename__ = "producto_imagenes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    url_imagen = Column(String(500), nullable=False)

    producto = relationship("Producto", back_populates="imagenes")