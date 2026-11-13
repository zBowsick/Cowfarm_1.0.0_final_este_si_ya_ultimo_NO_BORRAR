from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.auth_dependency import require_roles
from core.uploads import guardar_imagen
from models.usuario import Usuario
from schemas.productoImagen import ProductoImagenCreate, ProductoImagenResponse
from services import producto_imagen_service, producto_service

router = APIRouter(prefix="/producto-imagenes", tags=["Imágenes de Producto"])


def _verificar_propiedad(db: Session, producto_id: int, current_user: Usuario) -> None:
    """Un vendedor solo puede tocar imágenes de sus propios productos."""
    producto = producto_service.get_by_id(db, producto_id)
    if current_user.rol == "vendedor" and producto.productor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes gestionar imágenes de tus propios productos.",
        )


# Ruta pública: ver imágenes de un producto
@router.get("/producto/{producto_id}", response_model=List[ProductoImagenResponse])
def listar_imagenes_producto(producto_id: int, db: Session = Depends(get_db)):
    return producto_imagen_service.get_by_producto(db, producto_id)


# --- Subida de archivo desde el computador o el celular ---
@router.post("/upload", response_model=ProductoImagenResponse, status_code=status.HTTP_201_CREATED)
async def subir_imagen_producto(
    producto_id: int = Form(..., description="ID del producto al que pertenece la imagen"),
    archivo: UploadFile = File(..., description="Archivo de imagen (JPG, PNG, WEBP, GIF, AVIF)"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("vendedor", "administrador")),
):
    """
    Recibe la imagen como multipart/form-data, la guarda en el servidor y
    registra la ruta en la tabla producto_imagenes.

    Campos del formulario:
      - producto_id: número
      - archivo: el archivo seleccionado por el usuario
    """
    _verificar_propiedad(db, producto_id, current_user)
    url = guardar_imagen(archivo, subcarpeta="productos")
    return producto_imagen_service.create(
        db, ProductoImagenCreate(producto_id=producto_id, url_imagen=url)
    )


@router.post(
    "/upload-multiple",
    response_model=List[ProductoImagenResponse],
    status_code=status.HTTP_201_CREATED,
)
async def subir_varias_imagenes(
    producto_id: int = Form(...),
    archivos: List[UploadFile] = File(..., description="Una o varias imágenes"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("vendedor", "administrador")),
):
    """Igual que /upload pero permite mandar varias imágenes de una sola vez."""
    _verificar_propiedad(db, producto_id, current_user)
    creadas = []
    for archivo in archivos:
        url = guardar_imagen(archivo, subcarpeta="productos")
        creadas.append(
            producto_imagen_service.create(
                db, ProductoImagenCreate(producto_id=producto_id, url_imagen=url)
            )
        )
    return creadas


# Registrar una imagen que ya está publicada en internet (por URL)
@router.post("/", response_model=ProductoImagenResponse, status_code=status.HTTP_201_CREATED)
def agregar_imagen(
    data: ProductoImagenCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("vendedor", "administrador")),
):
    _verificar_propiedad(db, data.producto_id, current_user)
    return producto_imagen_service.create(db, data)


@router.delete("/{imagen_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_imagen(
    imagen_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("vendedor", "administrador")),
):
    imagen = producto_imagen_service.get_by_id(db, imagen_id)
    if current_user.rol == "vendedor" and imagen.producto.productor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes eliminar imágenes de tus propios productos.",
        )
    producto_imagen_service.delete(db, imagen_id)
