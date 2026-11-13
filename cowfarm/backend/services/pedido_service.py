from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.pedido import Pedido
from schemas.pedido import PedidoCreate, PedidoUpdate
from schemas.enums import EstadoPedido
from services.usuario_service import get_by_id as get_usuario

ESTADOS_CANCELABLES = {EstadoPedido.PENDIENTE, EstadoPedido.ACEPTADO}


def get_all(
    db: Session,
    comprador_id: Optional[int] = None,
    distribuidor_id: Optional[int] = None,
    estado: Optional[EstadoPedido] = None,
):
    query = db.query(Pedido)
    if comprador_id:
        query = query.filter(Pedido.comprador_id == comprador_id)
    if distribuidor_id:
        query = query.filter(Pedido.distribuidor_id == distribuidor_id)
    if estado:
        query = query.filter(Pedido.estado == estado)
    return query.all()


def get_by_id(db: Session, pedido_id: int) -> Pedido:
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
    return pedido


def create(db: Session, data: PedidoCreate) -> Pedido:
    get_usuario(db, data.comprador_id)  # Valida comprador

    pedido = Pedido(comprador_id=data.comprador_id, total=0)
    db.add(pedido)
    db.commit()
    db.refresh(pedido)

    if data.items:
        from services import detalle_pedido_service
        from schemas.detalle_pedido import DetallePedidoCreate

        for item in data.items:
            detalle_pedido_service.create(
                db,
                DetallePedidoCreate(
                    pedido_id=pedido.id,
                    producto_id=item.producto_id,
                    categoria_id=item.categoria_id,
                    cantidad=item.cantidad,
                ),
            )
        db.refresh(pedido)

    return pedido


def recalcular_total(db: Session, pedido_id: int) -> None:
    """Recalcula pedido.total como la suma de los subtotales de sus detalles."""
    pedido = get_by_id(db, pedido_id)
    total = sum((d.subtotal for d in pedido.detalles), start=0)
    pedido.total = total
    db.commit()


def update_estado(db: Session, pedido_id: int, data: PedidoUpdate) -> Pedido:
    pedido = get_by_id(db, pedido_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pedido, field, value)
    db.commit()
    db.refresh(pedido)

    # RF: al entregar el pedido se cierra automáticamente la venta (si aún no existe una).
    if pedido.estado == EstadoPedido.ENTREGADO:
        from models.venta import Venta
        from schemas.venta import VentaCreate
        from services import venta_service

        ya_tiene_venta = db.query(Venta).filter(Venta.pedido_id == pedido.id).first()
        if not ya_tiene_venta:
            venta_service.create(
                db, VentaCreate(pedido_id=pedido.id, valor_total=pedido.total)
            )
            db.refresh(pedido)

    return pedido


def asignar_distribuidor(db: Session, pedido_id: int, distribuidor_id: int) -> Pedido:
    """RF24: reasigna el distribuidor encargado de la entrega de un pedido."""
    pedido = get_by_id(db, pedido_id)
    distribuidor = get_usuario(db, distribuidor_id)  # valida que el usuario exista
    if distribuidor.rol != "distribuidor":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario indicado no tiene el rol 'distribuidor'.",
        )
    pedido.distribuidor_id = distribuidor_id
    db.commit()
    db.refresh(pedido)
    return pedido


def cancelar(db: Session, pedido_id: int) -> None:
    pedido = get_by_id(db, pedido_id)
    if pedido.estado not in ESTADOS_CANCELABLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede cancelar un pedido en estado '{pedido.estado}'",
        )
    pedido.estado = EstadoPedido.CANCELADO
    db.commit()