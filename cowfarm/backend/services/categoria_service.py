from typing import Optional

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.categoria import Categoria
from models.producto import Producto
from schemas.categoria import CategoriaCreate, CategoriaUpdate, generar_slug
from core.uploads import eliminar_imagen


def _slug_unico(db: Session, nombre: str, excluir_id: Optional[int] = None) -> str:
    """Genera un slug a partir del nombre y le agrega un sufijo si ya existe."""
    base = generar_slug(nombre)
    slug = base
    contador = 2
    while True:
        query = db.query(Categoria).filter(Categoria.slug == slug)
        if excluir_id is not None:
            query = query.filter(Categoria.id != excluir_id)
        if not query.first():
            return slug
        slug = f"{base}-{contador}"
        contador += 1


def _con_conteo(db: Session, categoria: Categoria) -> Categoria:
    """Adjunta cuántos productos tiene la categoría (campo calculado)."""
    categoria.total_productos = (
        db.query(Producto).filter(Producto.categoria_id == categoria.id).count()
    )
    return categoria


def get_all(db: Session):
    categorias = db.query(Categoria).order_by(Categoria.nombre.asc()).all()
    return [_con_conteo(db, c) for c in categorias]


def get_by_id(db: Session, categoria_id: int) -> Categoria:
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return _con_conteo(db, categoria)


def get_by_slug(db: Session, slug: str) -> Categoria:
    """
    Busca una categoría por su slug de URL. Si no la encuentra por slug
    (categorías viejas que aún no lo tienen), intenta por nombre.
    """
    slug_normalizado = generar_slug(slug)
    categoria = db.query(Categoria).filter(Categoria.slug == slug_normalizado).first()

    if not categoria:
        # Respaldo: comparar contra el nombre "slugificado" de cada categoría
        for posible in db.query(Categoria).all():
            if generar_slug(posible.nombre) == slug_normalizado:
                categoria = posible
                break

    if not categoria:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return _con_conteo(db, categoria)


def create(db: Session, data: CategoriaCreate) -> Categoria:
    nombre = data.nombre.strip()

    existente = db.query(Categoria).filter(Categoria.nombre == nombre).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe una categoría llamada «{nombre}».",
        )

    categoria = Categoria(
        nombre=nombre,
        descripcion=data.descripcion,
        imagen_url=data.imagen_url,
        slug=_slug_unico(db, nombre),
    )
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return _con_conteo(db, categoria)


def update(db: Session, categoria_id: int, data: CategoriaUpdate) -> Categoria:
    categoria = get_by_id(db, categoria_id)
    cambios = data.model_dump(exclude_unset=True)

    # Si se quita la imagen, borramos el archivo viejo del servidor.
    if "imagen_url" in cambios:
        nueva = cambios["imagen_url"] or None
        if categoria.imagen_url and categoria.imagen_url != nueva:
            eliminar_imagen(categoria.imagen_url)
        cambios["imagen_url"] = nueva

    for field, value in cambios.items():
        setattr(categoria, field, value)

    if "nombre" in cambios and cambios["nombre"]:
        categoria.slug = _slug_unico(db, cambios["nombre"], excluir_id=categoria.id)

    db.commit()
    db.refresh(categoria)
    return _con_conteo(db, categoria)


def set_imagen(db: Session, categoria_id: int, url_imagen: str) -> Categoria:
    """Asigna (y reemplaza) la imagen de portada de la categoría."""
    categoria = get_by_id(db, categoria_id)
    if categoria.imagen_url and categoria.imagen_url != url_imagen:
        eliminar_imagen(categoria.imagen_url)
    categoria.imagen_url = url_imagen
    db.commit()
    db.refresh(categoria)
    return _con_conteo(db, categoria)


def delete(db: Session, categoria_id: int) -> None:
    categoria = get_by_id(db, categoria_id)

    productos_asociados = (
        db.query(Producto).filter(Producto.categoria_id == categoria_id).count()
    )
    if productos_asociados:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"No se puede eliminar: la categoría tiene {productos_asociados} "
                "producto(s) publicados. Muévelos o elimínalos primero."
            ),
        )

    if categoria.imagen_url:
        eliminar_imagen(categoria.imagen_url)

    db.delete(categoria)
    db.commit()
