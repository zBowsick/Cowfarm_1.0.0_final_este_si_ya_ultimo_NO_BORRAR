
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class Direccion(Base):
    __tablename__ = "direcciones"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    departamento = Column(String(100), nullable=False)
    municipio = Column(String(100), nullable=False)
    vereda = Column(String(100), nullable=True)
    direccion = Column(String(255), nullable=True)

    usuario = relationship("Usuario", back_populates="direcciones")