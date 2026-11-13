import os

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
 
from models.usuario import Usuario
from schemas.usuario import UsuarioCreate, UsuarioUpdate
from core.security import hash_password
from core.oauth import DatosIdentidad
 
 
def get_all(db: Session):
    return db.query(Usuario).all()
 
 
def get_by_id(db: Session, usuario_id: int) -> Usuario:
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return usuario
 
 
def get_by_email(db: Session, email: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.email == email).first()
 
 
def create(db: Session, data: UsuarioCreate) -> Usuario:
    if get_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )
    datos = data.model_dump(exclude={"password"})
    usuario = Usuario(**datos, password=hash_password(data.password))
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario
 
 
def update(db: Session, usuario_id: int, data: UsuarioUpdate) -> Usuario:
    usuario = get_by_id(db, usuario_id)
    if data.email and data.email != usuario.email:
        if get_by_email(db, data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está en uso por otro usuario",
            )
    actualizaciones = data.model_dump(exclude_unset=True)
    if "password" in actualizaciones and actualizaciones["password"]:
        actualizaciones["password"] = hash_password(actualizaciones["password"])
    for field, value in actualizaciones.items():
        setattr(usuario, field, value)
    db.commit()
    db.refresh(usuario)
    return usuario


def update_rol(db: Session, usuario_id: int, rol: str) -> Usuario:
    usuario = get_by_id(db, usuario_id)
    usuario.rol = rol
    db.commit()
    db.refresh(usuario)
    return usuario
 
 
def delete(db: Session, usuario_id: int) -> None:
    usuario = get_by_id(db, usuario_id)
    db.delete(usuario)
    db.commit()


def obtener_o_crear_por_oauth(db: Session, datos: DatosIdentidad) -> Usuario:
    """
    Busca al usuario por email. Si ya existe (sin importar cómo se registró
    originalmente), se vincula el proveedor a esa cuenta y se le deja entrar
    con ella. Si no existe, se crea una cuenta nueva con rol "comprador"
    (el rol se puede cambiar después desde el Panel Admin).
    """
    usuario = get_by_email(db, datos.email)

    if usuario:
        # Vincula el proveedor a la cuenta existente (primera vez que usa
        # "Continuar con Google/Facebook" con un correo que ya tenía cuenta).
        cambios = False
        if usuario.proveedor_auth == "local" or not usuario.proveedor_id:
            usuario.proveedor_auth = datos.proveedor
            usuario.proveedor_id = datos.proveedor_id
            cambios = True
        if datos.avatar_url and usuario.avatar_url != datos.avatar_url:
            usuario.avatar_url = datos.avatar_url
            cambios = True
        if cambios:
            db.commit()
            db.refresh(usuario)
        return usuario

    # Cuenta nueva. La contraseña se rellena con un valor aleatorio e
    # inutilizable: esta cuenta solo se puede usar iniciando sesión con el
    # mismo proveedor (Google/Facebook), nunca con email y contraseña.
    usuario = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        email=datos.email,
        rol="comprador",
        password=hash_password(os.urandom(32).hex()),
        proveedor_auth=datos.proveedor,
        proveedor_id=datos.proveedor_id,
        avatar_url=datos.avatar_url,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario
