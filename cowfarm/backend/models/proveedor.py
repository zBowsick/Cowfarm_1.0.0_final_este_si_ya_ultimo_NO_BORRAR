from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from core.database import Base


class Proveedor(Base):
    

    __tablename__ = "proveedores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(150), nullable=False)
    tipo_suministro = Column(String(100), nullable=True)  # ej. "insumos", "ganado", "cultivos"
    contacto_nombre = Column(String(150), nullable=True)
    telefono = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)
    direccion = Column(String(255), nullable=True)
    activo = Column(Boolean, nullable=False, default=True)
    fecha_registro = Column(TIMESTAMP, server_default=func.now())
