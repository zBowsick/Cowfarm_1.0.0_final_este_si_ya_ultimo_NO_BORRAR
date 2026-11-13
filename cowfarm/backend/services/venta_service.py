from sqlalchemy.orm import Session
from fastapi import HTTPException, status
 
from models.venta import Venta
from schemas.venta import VentaCreate
from services.pedido_service import get_by_id as get_pedido
 
 
def get_all(db: Session):
    return db.query(Venta).all()
 
 
def get_by_id(db: Session, venta_id: int) -> Venta:
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venta no encontrada")
    return venta
 
 
def get_by_pedido(db: Session, pedido_id: int) -> Venta:
    get_pedido(db, pedido_id)  # Valida que el pedido exista
    venta = db.query(Venta).filter(Venta.pedido_id == pedido_id).first()
    if not venta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No existe venta registrada para este pedido",
        )
    return venta
 
 
def create(db: Session, data: VentaCreate) -> Venta:
    get_pedido(db, data.pedido_id)  # Valida que el pedido exista
    existente = db.query(Venta).filter(Venta.pedido_id == data.pedido_id).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una venta registrada para este pedido",
        )
    venta = Venta(**data.model_dump())
    db.add(venta)
    db.commit()
    db.refresh(venta)
    return venta
 