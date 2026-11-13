from sqlalchemy import (
    Column, Integer, String
)

from sqlalchemy.orm import relationship
from core.database import Base


class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)

    # Identificador para la URL de la categoría: /categoria/<slug>
    # Se genera automáticamente a partir del nombre:
    # "Frutas Frescas" -> "frutas-frescas"
    slug = Column(String(120), nullable=True, index=True)

    # Texto corto que se muestra en el encabezado de la categoría.
    descripcion = Column(String(500), nullable=True)

    # Imagen de portada. Puede ser una URL externa o una ruta subida por el
    # administrador (/uploads/categorias/xxx.jpg).
    imagen_url = Column(String(500), nullable=True)

    productos = relationship("Producto", back_populates="categoria")
