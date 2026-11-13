from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.auth_dependency import require_roles
from models.usuario import Usuario
from schemas.proveedor import ProveedorCreate, ProveedorUpdate, ProveedorResponse
from services import proveedor_service

router = APIRouter(prefix="/proveedores", tags=["Proveedores"])


# Solo administrador y vendedor gestionan/consultan proveedores (RF17)
@router.get("/", response_model=List[ProveedorResponse])
def listar_proveedores(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador", "vendedor")),
):
    return proveedor_service.get_all(db)


@router.get("/{proveedor_id}", response_model=ProveedorResponse)
def obtener_proveedor(
    proveedor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador", "vendedor")),
):
    return proveedor_service.get_by_id(db, proveedor_id)


# Crear, editar y eliminar proveedores: solo administrador
@router.post("/", response_model=ProveedorResponse, status_code=status.HTTP_201_CREATED)
def crear_proveedor(
    data: ProveedorCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    return proveedor_service.create(db, data)


@router.put("/{proveedor_id}", response_model=ProveedorResponse)
def actualizar_proveedor(
    proveedor_id: int,
    data: ProveedorUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    return proveedor_service.update(db, proveedor_id, data)


@router.delete("/{proveedor_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_proveedor(
    proveedor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    proveedor_service.delete(db, proveedor_id)
