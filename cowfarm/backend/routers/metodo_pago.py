from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.auth_dependency import require_roles
from models.usuario import Usuario
from schemas.metodo_pago import MetodoPagoCreate, MetodoPagoUpdate, MetodoPagoResponse
from services import metodo_pago_service

router = APIRouter(prefix="/metodos-pago", tags=["Métodos de pago"])


# Ruta pública: cualquier comprador debe ver qué métodos de pago están
# disponibles al momento de pagar. Usa ?solo_activos=true para filtrar
# los que el administrador desactivó.
@router.get("/", response_model=List[MetodoPagoResponse])
def listar_metodos_pago(solo_activos: bool = False, db: Session = Depends(get_db)):
    return metodo_pago_service.get_all(db, solo_activos=solo_activos)


@router.get("/{metodo_id}", response_model=MetodoPagoResponse)
def obtener_metodo_pago(metodo_id: int, db: Session = Depends(get_db)):
    return metodo_pago_service.get_by_id(db, metodo_id)


# Rutas protegidas: solo administrador gestiona el catálogo (RF15)
@router.post("/", response_model=MetodoPagoResponse, status_code=status.HTTP_201_CREATED)
def crear_metodo_pago(
    data: MetodoPagoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    return metodo_pago_service.create(db, data)


@router.put("/{metodo_id}", response_model=MetodoPagoResponse)
def actualizar_metodo_pago(
    metodo_id: int,
    data: MetodoPagoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    return metodo_pago_service.update(db, metodo_id, data)


@router.delete("/{metodo_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_metodo_pago(
    metodo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    metodo_pago_service.delete(db, metodo_id)
