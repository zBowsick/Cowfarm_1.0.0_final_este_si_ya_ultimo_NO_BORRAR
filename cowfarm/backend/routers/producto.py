from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
from core.auth_dependency import require_roles
from models.usuario import Usuario
from schemas.producto import ProductoCreate, ProductoUpdate, ProductoResponse
from services import producto_service

router = APIRouter(prefix="/productos", tags=["Productos"])


# Ruta pública: cualquiera puede ver el catálogo
@router.get("/", response_model=List[ProductoResponse])
def listar_productos(
    categoria_id: Optional[int] = None,
    productor_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    return producto_service.get_all(db, categoria_id=categoria_id, productor_id=productor_id)


@router.get("/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    return producto_service.get_by_id(db, producto_id)


# Rutas protegidas: solo vendedor o administrador gestionan el inventario
@router.post("/", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("vendedor", "administrador")),
):
    if current_user.rol == "vendedor" and data.productor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes registrar productos a tu propio nombre.",
        )
    return producto_service.create(db, data)


@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("vendedor", "administrador")),
):
    producto = producto_service.get_by_id(db, producto_id)
    if current_user.rol == "vendedor" and producto.productor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes modificar tus propios productos.",
        )
    return producto_service.update(db, producto_id, data)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("vendedor", "administrador")),
):
    producto = producto_service.get_by_id(db, producto_id)
    if current_user.rol == "vendedor" and producto.productor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes eliminar tus propios productos.",
        )
    producto_service.delete(db, producto_id)