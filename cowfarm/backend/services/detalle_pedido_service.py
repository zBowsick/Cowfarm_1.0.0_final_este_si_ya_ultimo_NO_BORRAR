from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.detalle_pedido import DetallePedido
from schemas.detalle_pedido import DetallePedidoCreate, DetallePedidoUpdate
from services.pedido_service import get_by_id as get_pedido, recalcular_total
from services.producto_service import get_by_id as get_producto


def get_by_pedido(db: Session, pedido_id: int):
    get_pedido(db, pedido_id)  # valida que el pedido exista
    return db.query(DetallePedido).filter(DetallePedido.pedido_id == pedido_id).all()


def get_by_id(db: Session, detalle_id: int) -> DetallePedido:
    detalle = db.query(DetallePedido).filter(DetallePedido.id == detalle_id).first()
    if not detalle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Detalle de pedido no encontrado")
    return detalle


def create(db: Session, data: DetallePedidoCreate) -> DetallePedido:
    get_pedido(db, data.pedido_id)  # valida que el pedido exista
    producto = get_producto(db, data.producto_id)

    if producto.categoria_id != data.categoria_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El producto '{producto.nombre}' no pertenece a la categoría indicada "
                   f"(su categoría real es la #{producto.categoria_id}).",
        )

    if producto.stock < data.cantidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock})",
        )

    precio_unitario = producto.precio
    subtotal = precio_unitario * data.cantidad

    detalle = DetallePedido(
        pedido_id=data.pedido_id,
        producto_id=data.producto_id,
        cantidad=data.cantidad,
        precio_unitario=precio_unitario,
        subtotal=subtotal,
    )
    db.add(detalle)
    producto.stock -= data.cantidad
    db.commit()
    db.refresh(detalle)

    recalcular_total(db, data.pedido_id)
    db.refresh(detalle)
    return detalle


def update(db: Session, detalle_id: int, data: DetallePedidoUpdate) -> DetallePedido:
    detalle = get_by_id(db, detalle_id)
    producto = get_producto(db, detalle.producto_id)

    diferencia = data.cantidad - detalle.cantidad
    if diferencia > 0 and producto.stock < diferencia:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock})",
        )

    producto.stock -= diferencia
    detalle.cantidad = data.cantidad
    detalle.precio_unitario = producto.precio
    detalle.subtotal = producto.precio * data.cantidad

    db.commit()
    db.refresh(detalle)

    recalcular_total(db, detalle.pedido_id)
    db.refresh(detalle)
    return detalle


def delete(db: Session, detalle_id: int) -> None:
    detalle = get_by_id(db, detalle_id)
    pedido_id = detalle.pedido_id

    producto = get_producto(db, detalle.producto_id)
    producto.stock += detalle.cantidad

    db.delete(detalle)
    db.commit()

    recalcular_total(db, pedido_id)