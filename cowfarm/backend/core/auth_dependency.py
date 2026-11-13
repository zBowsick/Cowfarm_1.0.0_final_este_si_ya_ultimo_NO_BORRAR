from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import decode_token
from models.usuario import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise credentials_exception
    return usuario


def require_roles(*roles_permitidos: str):
    """
    Fábrica de dependencias para restringir un endpoint a ciertos roles.
    Uso: current_user: Usuario = Depends(require_roles("ADMIN"))
    Uso (varios roles): Depends(require_roles("PRODUCTOR", "ADMIN"))
    """
    def verificador(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if current_user.rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Esta acción requiere uno de estos roles: {', '.join(roles_permitidos)}.",
            )
        return current_user
    return verificador
