from sqlalchemy.orm import Session
from fastapi import HTTPException, status
 
from models.productoImagen import ProductoImagen
from schemas.productoImagen import ProductoImagenCreate
from services.producto_service import get_by_id as get_producto
from core.uploads import eliminar_imagen
 
 
def get_by_producto(db: Session, producto_id: int):
    get_producto(db, producto_id)  # Valida que el producto exista
    return db.query(ProductoImagen).filter(ProductoImagen.producto_id == producto_id).all()
 
 
def get_by_id(db: Session, imagen_id: int) -> ProductoImagen:
    imagen = db.query(ProductoImagen).filter(ProductoImagen.id == imagen_id).first()
    if not imagen:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada")
    return imagen
 
 
def create(db: Session, data: ProductoImagenCreate) -> ProductoImagen:
    get_producto(db, data.producto_id)  # Valida que el producto exista
    imagen = ProductoImagen(**data.model_dump())
    db.add(imagen)
    db.commit()
    db.refresh(imagen)
    return imagen
 
 
def delete(db: Session, imagen_id: int) -> None:
    imagen = get_by_id(db, imagen_id)
    url = imagen.url_imagen
    db.delete(imagen)
    db.commit()
    # Si el archivo estaba guardado en nuestro servidor, se borra del disco
    # para no dejar imágenes huérfanas ocupando espacio.
    eliminar_imagen(url)
 