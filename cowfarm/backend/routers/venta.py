from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.auth_dependency import require_roles
from models.usuario import Usuario
from schemas.venta import VentaCreate, VentaResponse
from services import venta_service

router = APIRouter(prefix="/ventas", tags=["Ventas"])


# Las ventas son información comercial: solo vendedor o administrador las consultan
@router.get("/", response_model=List[VentaResponse])
def listar_ventas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("vendedor", "administrador")),
):
    return venta_service.get_all(db)


@router.get("/pedido/{pedido_id}", response_model=VentaResponse)
def obtener_venta_por_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("vendedor", "administrador")),
):
    return venta_service.get_by_pedido(db, pedido_id)


@router.get("/{venta_id}", response_model=VentaResponse)
def obtener_venta(
    venta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("vendedor", "administrador")),
):
    return venta_service.get_by_id(db, venta_id)


# El registro formal de la venta lo cierra un administrador (tras confirmar el pago)
@router.post("/", response_model=VentaResponse, status_code=status.HTTP_201_CREATED)
def registrar_venta(
    data: VentaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    return venta_service.create(db, data)