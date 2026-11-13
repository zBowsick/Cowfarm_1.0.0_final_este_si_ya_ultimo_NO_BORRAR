from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    telefono = Column(String(20), nullable=True)
    password = Column(String(255), nullable=False)
    rol = Column(
        Enum("comprador", "vendedor", "administrador", "distribuidor", name="rol_usuario"),
        nullable=False,
    )
    fecha_registro = Column(TIMESTAMP, server_default=func.now())

    # --- Inicio de sesión con Google / Facebook ---
    # "local" = se registró con email y contraseña (como siempre).
    # "google" / "facebook" = la cuenta se creó (o se vinculó) al iniciar
    # sesión con ese proveedor. La contraseña igual se guarda (aleatoria e
    # inutilizable) para no tener que volver la columna opcional.
    proveedor_auth = Column(String(20), nullable=False, server_default="local")
    proveedor_id = Column(String(255), nullable=True)  # "sub" de Google / "id" de Facebook
    avatar_url = Column(String(500), nullable=True)

    direcciones = relationship("Direccion", back_populates="usuario", cascade="all, delete-orphan")
    productos = relationship("Producto", back_populates="productor", cascade="all, delete-orphan")
    pedidos = relationship(
        "Pedido", back_populates="comprador", cascade="all, delete-orphan",
        foreign_keys="Pedido.comprador_id",
    )
    # Pedidos que este usuario tiene asignados como distribuidor (RF24). No se
    # usa cascade "delete-orphan" aquí: borrar un distribuidor no debe borrar
    # los pedidos, solo se desasignaría (ver services/usuario_service.py).
    pedidos_asignados = relationship(
        "Pedido", back_populates="distribuidor", foreign_keys="Pedido.distribuidor_id",
    )
