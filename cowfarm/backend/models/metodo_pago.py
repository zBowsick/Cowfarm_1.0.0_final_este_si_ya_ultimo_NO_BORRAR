from sqlalchemy import Column, Integer, String, Boolean
from core.database import Base


class MetodoPago(Base):
    """RF15: catálogo administrable de métodos de pago disponibles para los
    compradores (efectivo, transferencia, tarjeta, billetera digital, etc.).

    Nota: el campo `metodo_pago` de la tabla `pagos` sigue siendo un Enum fijo
    por compatibilidad con lo ya implementado; este catálogo es lo que el
    administrador gestiona y lo que el frontend debe usar para mostrar las
    opciones habilitadas en el checkout.
    """

    __tablename__ = "metodos_pago"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(String(255), nullable=True)
    activo = Column(Boolean, nullable=False, default=True)
