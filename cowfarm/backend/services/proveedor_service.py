from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.proveedor import Proveedor
from schemas.proveedor import ProveedorCreate, ProveedorUpdate


def get_all(db: Session):
    return db.query(Proveedor).all()


def get_by_id(db: Session, proveedor_id: int) -> Proveedor:
    proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not proveedor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proveedor no encontrado")
    return proveedor


def create(db: Session, data: ProveedorCreate) -> Proveedor:
    proveedor = Proveedor(**data.model_dump())
    db.add(proveedor)
    db.commit()
    db.refresh(proveedor)
    return proveedor


def update(db: Session, proveedor_id: int, data: ProveedorUpdate) -> Proveedor:
    proveedor = get_by_id(db, proveedor_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(proveedor, field, value)
    db.commit()
    db.refresh(proveedor)
    return proveedor


def delete(db: Session, proveedor_id: int) -> None:
    proveedor = get_by_id(db, proveedor_id)
    db.delete(proveedor)
    db.commit()
