from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
from core.auth_dependency import get_current_user, require_roles
from models.usuario import Usuario
from schemas.pedido import (
    PedidoCreate,
    PedidoUpdate,
    PedidoResponse,
    PedidoCreadoResponse,
    PedidoDistribuidorUpdate,
)
from schemas.enums import EstadoPedido
from services import pedido_service

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


# comprador ve solo sus pedidos; distribuidor ve solo los que tiene asignados;
# vendedor y administrador ven todos (para gestionar despachos)
@router.get("/", response_model=List[PedidoResponse])
def listar_pedidos(
    comprador_id: Optional[int] = None,
    distribuidor_id: Optional[int] = None,
    estado: Optional[EstadoPedido] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol == "comprador":
        comprador_id = current_user.id
    if current_user.rol == "distribuidor":
        distribuidor_id = current_user.id
    return pedido_service.get_all(
        db, comprador_id=comprador_id, distribuidor_id=distribuidor_id, estado=estado
    )


@router.get("/{pedido_id}", response_model=PedidoResponse)
def obtener_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pedido = pedido_service.get_by_id(db, pedido_id)
    if current_user.rol == "comprador" and pedido.comprador_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes consultar tus propios pedidos.",
        )
    return pedido


# Solo el comprador (para sí mismo) o un administrador pueden crear pedidos
@router.post("/", response_model=PedidoCreadoResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("comprador", "administrador")),
):
    if current_user.rol == "comprador" and data.comprador_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes crear pedidos a tu propio nombre.",
        )
    pedido = pedido_service.create(db, data)
    # Respuesta simple. Para ver el detalle completo (productos, categorías,
    # precios) usa GET /detalle-pedido/pedido/{pedido_id} o GET /pedidos/{pedido_id}.
    return PedidoCreadoResponse(pedido_id=pedido.id, total=pedido.total)


# Vendedor y administrador gestionan el estado de cualquier pedido (aceptar,
# preparar). El distribuidor también puede actualizar el estado, pero solo
# de los pedidos que tiene asignados (despachar, marcar como entregado).
@router.patch("/{pedido_id}/estado", response_model=PedidoResponse)
def actualizar_estado_pedido(
    pedido_id: int,
    data: PedidoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(
        require_roles("vendedor", "administrador", "distribuidor")
    ),
):
    if current_user.rol == "distribuidor":
        pedido = pedido_service.get_by_id(db, pedido_id)
        if pedido.distribuidor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo puedes actualizar el estado de los pedidos que tienes asignados.",
            )
    return pedido_service.update_estado(db, pedido_id, data)


# Solo administrador reasigna el distribuidor encargado de la entrega (RF24)
@router.patch("/{pedido_id}/distribuidor", response_model=PedidoResponse)
def reasignar_distribuidor(
    pedido_id: int,
    data: PedidoDistribuidorUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    return pedido_service.asignar_distribuidor(db, pedido_id, data.distribuidor_id)


# El comprador dueño del pedido o un administrador pueden cancelarlo
@router.delete("/{pedido_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pedido = pedido_service.get_by_id(db, pedido_id)
    if current_user.rol == "comprador" and pedido.comprador_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes cancelar tus propios pedidos.",
        )
    if current_user.rol not in ("comprador", "administrador"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para cancelar pedidos.",
        )
    pedido_service.cancelar(db, pedido_id)