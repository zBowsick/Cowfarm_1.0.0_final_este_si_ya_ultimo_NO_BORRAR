from sqlalchemy import Column, Integer, DECIMAL, TIMESTAMP, Enum, ForeignKey, func
from sqlalchemy.orm import relationship
from core.database import Base

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    comprador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    # RF24: distribuidor encargado de la entrega. Es opcional (se asigna después
    # de crear el pedido) y un administrador puede reasignarlo en cualquier momento.
    distribuidor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    fecha_pedido = Column(TIMESTAMP, server_default=func.now())
    estado = Column(
        Enum("PENDIENTE", "ACEPTADO", "EN_PREPARACION", "EN_CAMINO", "ENTREGADO", "CANCELADO",
            name="estado_pedido"),
        nullable=False, default="PENDIENTE"
    )
    total = Column(DECIMAL(12, 2), nullable=False, default=0)

    comprador = relationship("Usuario", back_populates="pedidos", foreign_keys=[comprador_id])
    distribuidor = relationship("Usuario", back_populates="pedidos_asignados", foreign_keys=[distribuidor_id])
    detalles = relationship("DetallePedido", back_populates="pedido", cascade="all, delete-orphan")
    pagos = relationship("Pago", back_populates="pedido", cascade="all, delete-orphan")
    venta = relationship("Venta", back_populates="pedido", uselist=False, cascade="all, delete-orphan")

    # ------------------------------------------------------------------
    # Datos de entrega (los usa el distribuidor en "Mis entregas").
    # Son solo lectura: se calculan a partir del comprador y de los pagos
    # y el schema PedidoResponse los expone.
    # ------------------------------------------------------------------
    @property
    def comprador_nombre(self):
        if not self.comprador:
            return None
        return f"{self.comprador.nombre} {self.comprador.apellido}".strip()

    @property
    def comprador_telefono(self):
        return self.comprador.telefono if self.comprador else None

    @property
    def direccion_entrega(self):
        """Dirección más reciente registrada por el comprador (el pedido no
        guarda una dirección propia, así que se usa la última del comprador)."""
        if not self.comprador or not self.comprador.direcciones:
            return None
        d = max(self.comprador.direcciones, key=lambda x: x.id)
        partes = [d.direccion, d.vereda, d.municipio, d.departamento]
        return ", ".join(p for p in partes if p) or None

    @property
    def pago_estado(self):
        """PAGADO            -> hay un pago confirmado por el total del pedido
        EFECTIVO          -> se paga en efectivo y aún no se ha cobrado (cobrar al entregar)
        PENDIENTE         -> hay pago registrado (no efectivo) sin confirmar
        SIN_PAGO          -> no hay ningún pago registrado
        """
        pagos = [p for p in (self.pagos or []) if p.estado != "RECHAZADO"]
        if not pagos:
            return "SIN_PAGO"
        pagado = sum((p.monto for p in pagos if p.estado == "PAGADO"), start=0)
        if pagado > 0 and pagado >= (self.total or 0):
            return "PAGADO"
        if any(p.metodo_pago == "EFECTIVO" and p.estado == "PENDIENTE" for p in pagos):
            return "EFECTIVO"
        return "PENDIENTE"

    @property
    def pago_metodo(self):
        pagos = [p for p in (self.pagos or []) if p.estado != "RECHAZADO"]
        if not pagos:
            return None
        pagos.sort(key=lambda p: p.id)
        return pagos[-1].metodo_pago
