from sqlalchemy.orm import Session
from fastapi import HTTPException, status
 
from models.pago import Pago
from schemas.pago import PagoCreate, PagoUpdate
from services.pedido_service import get_by_id as get_pedido
 
 
def get_by_pedido(db: Session, pedido_id: int):
    get_pedido(db, pedido_id)  # Valida que el pedido exista
    return db.query(Pago).filter(Pago.pedido_id == pedido_id).all()
 
 
def get_by_id(db: Session, pago_id: int) -> Pago:
    pago = db.query(Pago).filter(Pago.id == pago_id).first()
    if not pago:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago no encontrado")
    return pago
 
 
def create(db: Session, data: PagoCreate) -> Pago:
    get_pedido(db, data.pedido_id)  # Valida que el pedido exista
    pago = Pago(**data.model_dump())
    db.add(pago)
    db.commit()
    db.refresh(pago)
    return pago
 
 
def update_estado(db: Session, pago_id: int, data: PagoUpdate) -> Pago:
    pago = get_by_id(db, pago_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pago, field, value)
    db.commit()
    db.refresh(pago)
    return pago
 