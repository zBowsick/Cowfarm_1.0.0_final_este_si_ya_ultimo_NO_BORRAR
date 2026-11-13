from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.metodo_pago import MetodoPago
from schemas.metodo_pago import MetodoPagoCreate, MetodoPagoUpdate


def get_all(db: Session, solo_activos: bool = False):
    query = db.query(MetodoPago)
    if solo_activos:
        query = query.filter(MetodoPago.activo.is_(True))
    return query.all()


def get_by_id(db: Session, metodo_id: int) -> MetodoPago:
    metodo = db.query(MetodoPago).filter(MetodoPago.id == metodo_id).first()
    if not metodo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Método de pago no encontrado")
    return metodo


def get_by_nombre(db: Session, nombre: str) -> MetodoPago | None:
    return db.query(MetodoPago).filter(MetodoPago.nombre == nombre).first()


def create(db: Session, data: MetodoPagoCreate) -> MetodoPago:
    if get_by_nombre(db, data.nombre):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un método de pago con ese nombre",
        )
    metodo = MetodoPago(**data.model_dump())
    db.add(metodo)
    db.commit()
    db.refresh(metodo)
    return metodo


def update(db: Session, metodo_id: int, data: MetodoPagoUpdate) -> MetodoPago:
    metodo = get_by_id(db, metodo_id)
    actualizaciones = data.model_dump(exclude_unset=True)
    if "nombre" in actualizaciones and actualizaciones["nombre"] != metodo.nombre:
        if get_by_nombre(db, actualizaciones["nombre"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un método de pago con ese nombre",
            )
    for field, value in actualizaciones.items():
        setattr(metodo, field, value)
    db.commit()
    db.refresh(metodo)
    return metodo


def delete(db: Session, metodo_id: int) -> None:
    metodo = get_by_id(db, metodo_id)
    db.delete(metodo)
    db.commit()
