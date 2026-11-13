from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.auth_dependency import require_roles
from core.uploads import guardar_imagen
from models.usuario import Usuario
from schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaResponse
from services import categoria_service

router = APIRouter(prefix="/categorias", tags=["Categorías"])


# Rutas públicas: cualquiera puede ver las categorías
@router.get("/", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return categoria_service.get_all(db)


# IMPORTANTE: esta ruta va ANTES de /{categoria_id} para que "slug" no se
# interprete como un id numérico.
@router.get("/slug/{slug}", response_model=CategoriaResponse)
def obtener_categoria_por_slug(slug: str, db: Session = Depends(get_db)):
    """Permite abrir una categoría desde la URL amigable: /categoria/frutas-frescas"""
    return categoria_service.get_by_slug(db, slug)


@router.get("/{categoria_id}", response_model=CategoriaResponse)
def obtener_categoria(categoria_id: int, db: Session = Depends(get_db)):
    return categoria_service.get_by_id(db, categoria_id)


# Rutas protegidas: solo administrador gestiona las categorías
@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    data: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    return categoria_service.create(db, data)


@router.put("/{categoria_id}", response_model=CategoriaResponse)
def actualizar_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    return categoria_service.update(db, categoria_id, data)


@router.post("/{categoria_id}/imagen", response_model=CategoriaResponse)
async def subir_imagen_categoria(
    categoria_id: int,
    archivo: UploadFile = File(..., description="Imagen de portada de la categoría"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    """
    Sube la imagen de portada de la categoría desde el computador o el celular.
    Se envía como multipart/form-data con el campo `archivo`.
    """
    categoria_service.get_by_id(db, categoria_id)  # valida que exista
    url = guardar_imagen(archivo, subcarpeta="categorias")
    return categoria_service.set_imagen(db, categoria_id, url)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("administrador")),
):
    categoria_service.delete(db, categoria_id)
