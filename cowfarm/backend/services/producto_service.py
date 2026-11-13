from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
 
from models.producto import Producto
from schemas.producto import ProductoCreate, ProductoUpdate
from services.usuario_service import get_by_id as get_usuario
from services.categoria_service import get_by_id as get_categoria
 
 
def get_all(db: Session, categoria_id: Optional[int] = None, productor_id: Optional[int] = None):
    query = db.query(Producto)
    if categoria_id:
        query = query.filter(Producto.categoria_id == categoria_id)
    if productor_id:
        query = query.filter(Producto.productor_id == productor_id)
    return query.all()
 
 
def get_by_id(db: Session, producto_id: int) -> Producto:
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return producto
 
 
def create(db: Session, data: ProductoCreate) -> Producto:
    get_usuario(db, data.productor_id)   # Valida productor
    get_categoria(db, data.categoria_id) # Valida categoría
    producto = Producto(**data.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto
 
 
def update(db: Session, producto_id: int, data: ProductoUpdate) -> Producto:
    producto = get_by_id(db, producto_id)
    if data.categoria_id:
        get_categoria(db, data.categoria_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(producto, field, value)
    db.commit()
    db.refresh(producto)
    return producto
 
 
def delete(db: Session, producto_id: int) -> None:
    producto = get_by_id(db, producto_id)
    db.delete(producto)
    db.commit()
 