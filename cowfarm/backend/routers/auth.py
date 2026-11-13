from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import verify_password, create_access_token
from core.oauth import verificar_google, verificar_facebook
from models.usuario import Usuario
from schemas.oauth import GoogleLoginRequest, FacebookLoginRequest
from services.usuario_service import obtener_o_crear_por_oauth

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def _token_para(usuario: Usuario) -> dict:
    token = create_access_token({"sub": usuario.email, "rol": usuario.rol})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == form.username).first()
    if not usuario or not verify_password(form.password, usuario.password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas.")

    return _token_para(usuario)


@router.post("/google")
def login_con_google(data: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Inicio de sesión con Google. El frontend (Google Identity Services)
    entrega un "ID token" firmado por Google; aquí se verifica su firma y
    se busca o crea la cuenta correspondiente.
    """
    identidad = verificar_google(data.credential)
    usuario = obtener_o_crear_por_oauth(db, identidad)
    return _token_para(usuario)


@router.post("/facebook")
def login_con_facebook(data: FacebookLoginRequest, db: Session = Depends(get_db)):
    """
    Inicio de sesión con Facebook. El frontend (Facebook SDK) entrega un
    access token; aquí se verifica contra la Graph API de Facebook antes de
    confiar en los datos del perfil.
    """
    identidad = verificar_facebook(data.access_token)
    usuario = obtener_o_crear_por_oauth(db, identidad)
    return _token_para(usuario)
