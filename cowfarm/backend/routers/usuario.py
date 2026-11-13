from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.auth_dependency import get_current_user, require_roles
from models.usuario import Usuario
from schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse, UsuarioRolUpdate
from services import usuario_service

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


# Ruta pública: cualquiera puede registrarse
@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    return usuario_service.create(db, data)


# Cada usuario consulta su propio perfil
@router.get("/me", response_model=UsuarioResponse)
def obtener_mi_perfil(current_user: Usuario = Depends(get_current_user)):
    return current_user


# Rutas protegidas: solo administrador gestiona el listado completo de usuarios
@router.get("/", response_model=List[UsuarioResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    return usuario_service.get_all(db)


@router.get("/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    return usuario_service.get_by_id(db, usuario_id)


# El propio usuario o un administrador pueden actualizar el perfil
@router.put("/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(
    usuario_id: int,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.id != usuario_id and current_user.rol != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes actualizar tu propio perfil.",
        )
    return usuario_service.update(db, usuario_id, data)


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    usuario_service.delete(db, usuario_id)


# Solo administrador puede cambiar el rol de un usuario (comprador / vendedor / administrador)
@router.patch("/{usuario_id}/rol", response_model=UsuarioResponse)
def cambiar_rol(
    usuario_id: int,
    data: UsuarioRolUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    return usuario_service.update_rol(db, usuario_id, data.rol)