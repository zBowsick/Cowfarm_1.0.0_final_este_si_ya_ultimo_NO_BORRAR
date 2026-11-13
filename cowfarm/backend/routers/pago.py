from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.auth_dependency import get_current_user, require_roles
from models.usuario import Usuario
from schemas.pago import PagoCreate, PagoUpdate, PagoResponse
from services import pago_service, pedido_service

router = APIRouter(prefix="/pagos", tags=["Pagos"])


@router.get("/pedido/{pedido_id}", response_model=List[PagoResponse])
def listar_pagos_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pedido = pedido_service.get_by_id(db, pedido_id)
    if current_user.rol == "comprador" and pedido.comprador_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes consultar los pagos de tus propios pedidos.",
        )
    return pago_service.get_by_pedido(db, pedido_id)


@router.get("/{pago_id}", response_model=PagoResponse)
def obtener_pago(
    pago_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pago = pago_service.get_by_id(db, pago_id)
    pedido = pedido_service.get_by_id(db, pago.pedido_id)
    if current_user.rol == "comprador" and pedido.comprador_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes consultar los pagos de tus propios pedidos.",
        )
    return pago


# Solo el comprador dueño del pedido o un administrador registran un pago
@router.post("/", response_model=PagoResponse, status_code=status.HTTP_201_CREATED)
def registrar_pago(
    data: PagoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("comprador", "administrador")),
):
    pedido = pedido_service.get_by_id(db, data.pedido_id)
    if current_user.rol == "comprador" and pedido.comprador_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes registrar pagos de tus propios pedidos.",
        )
    return pago_service.create(db, data)


# Solo administrador confirma o rechaza el estado de un pago
@router.patch("/{pago_id}/estado", response_model=PagoResponse)
def actualizar_estado_pago(
    pago_id: int,
    data: PagoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    return pago_service.update_estado(db, pago_id, data)