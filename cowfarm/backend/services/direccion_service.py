from sqlalchemy.orm import Session
from fastapi import HTTPException, status
 
from models.direccion import Direccion
from schemas.direccion import DireccionCreate, DireccionUpdate
from services.usuario_service import get_by_id as get_usuario
 
 
def get_by_usuario(db: Session, usuario_id: int):
    get_usuario(db, usuario_id)  # Valida que el usuario exista
    return db.query(Direccion).filter(Direccion.usuario_id == usuario_id).all()
 
 
def get_by_id(db: Session, direccion_id: int) -> Direccion:
    direccion = db.query(Direccion).filter(Direccion.id == direccion_id).first()
    if not direccion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dirección no encontrada")
    return direccion
 
 
def create(db: Session, data: DireccionCreate) -> Direccion:
    get_usuario(db, data.usuario_id)  # Valida que el usuario exista
    direccion = Direccion(**data.model_dump())
    db.add(direccion)
    db.commit()
    db.refresh(direccion)
    return direccion
 
 
def update(db: Session, direccion_id: int, data: DireccionUpdate) -> Direccion:
    direccion = get_by_id(db, direccion_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(direccion, field, value)
    db.commit()
    db.refresh(direccion)
    return direccion
 
 
def delete(db: Session, direccion_id: int) -> None:
    direccion = get_by_id(db, direccion_id)
    db.delete(direccion)
    db.commit()
 