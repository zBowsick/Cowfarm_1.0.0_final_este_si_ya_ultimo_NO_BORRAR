from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
 
from core.database import get_db
from core.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.direccion import DireccionCreate, DireccionUpdate, DireccionResponse
from services import direccion_service
 
router = APIRouter(prefix="/direcciones", tags=["Direcciones"])


def _verificar_propietario_o_admin(current_user: Usuario, usuario_id: int):
    if current_user.id != usuario_id and current_user.rol != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes gestionar tus propias direcciones.",
        )


@router.get("/usuario/{usuario_id}", response_model=List[DireccionResponse])
def listar_direcciones_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _verificar_propietario_o_admin(current_user, usuario_id)
    return direccion_service.get_by_usuario(db, usuario_id)
 
 
@router.get("/{direccion_id}", response_model=DireccionResponse)
def obtener_direccion(
    direccion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    direccion = direccion_service.get_by_id(db, direccion_id)
    _verificar_propietario_o_admin(current_user, direccion.usuario_id)
    return direccion
 
 
@router.post("/", response_model=DireccionResponse, status_code=status.HTTP_201_CREATED)
def crear_direccion(
    data: DireccionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _verificar_propietario_o_admin(current_user, data.usuario_id)
    return direccion_service.create(db, data)
 
 
@router.put("/{direccion_id}", response_model=DireccionResponse)
def actualizar_direccion(
    direccion_id: int,
    data: DireccionUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    direccion = direccion_service.get_by_id(db, direccion_id)
    _verificar_propietario_o_admin(current_user, direccion.usuario_id)
    return direccion_service.update(db, direccion_id, data)
 
 
@router.delete("/{direccion_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_direccion(
    direccion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    direccion = direccion_service.get_by_id(db, direccion_id)
    _verificar_propietario_o_admin(current_user, direccion.usuario_id)
    direccion_service.delete(db, direccion_id)
