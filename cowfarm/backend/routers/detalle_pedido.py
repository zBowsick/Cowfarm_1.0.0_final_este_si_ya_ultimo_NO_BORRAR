from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.auth_dependency import get_current_user, require_roles
from models.usuario import Usuario
from schemas.detalle_pedido import DetallePedidoCreate, DetallePedidoUpdate, DetallePedidoResponse
from services import detalle_pedido_service, pedido_service

router = APIRouter(prefix="/detalle-pedido", tags=["Detalle de Pedido"])


def _validar_dueno_pedido(current_user: Usuario, pedido_id: int, db: Session):
    """El comprador solo puede ver/tocar detalles de sus propios pedidos."""
    if current_user.rol == "comprador":
        pedido = pedido_service.get_by_id(db, pedido_id)
        if pedido.comprador_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo puedes consultar o modificar los detalles de tus propios pedidos.",
            )


@router.get("/pedido/{pedido_id}", response_model=List[DetallePedidoResponse])
def listar_detalles_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _validar_dueno_pedido(current_user, pedido_id, db)
    return detalle_pedido_service.get_by_pedido(db, pedido_id)


@router.get("/{detalle_id}", response_model=DetallePedidoResponse)
def obtener_detalle(
    detalle_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    detalle = detalle_pedido_service.get_by_id(db, detalle_id)
    _validar_dueno_pedido(current_user, detalle.pedido_id, db)
    return detalle


# Solo el comprador dueño del pedido, un vendedor o un administrador agregan/editan detalles
@router.post("/", response_model=DetallePedidoResponse, status_code=status.HTTP_201_CREATED)
def agregar_detalle(
    data: DetallePedidoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("comprador", "vendedor", "administrador")),
):
    _validar_dueno_pedido(current_user, data.pedido_id, db)
    return detalle_pedido_service.create(db, data)


@router.put("/{detalle_id}", response_model=DetallePedidoResponse)
def actualizar_detalle(
    detalle_id: int,
    data: DetallePedidoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("comprador", "vendedor", "administrador")),
):
    detalle = detalle_pedido_service.get_by_id(db, detalle_id)
    _validar_dueno_pedido(current_user, detalle.pedido_id, db)
    return detalle_pedido_service.update(db, detalle_id, data)


@router.delete("/{detalle_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_detalle(
    detalle_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("comprador", "vendedor", "administrador")),
):
    detalle = detalle_pedido_service.get_by_id(db, detalle_id)
    _validar_dueno_pedido(current_user, detalle.pedido_id, db)
    detalle_pedido_service.delete(db, detalle_id)