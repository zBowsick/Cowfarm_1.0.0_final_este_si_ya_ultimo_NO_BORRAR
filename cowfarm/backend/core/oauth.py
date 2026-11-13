"""
core/oauth.py — Verificación de identidad con Google y Facebook.

Filosofía de seguridad: el frontend NUNCA nos dice "este usuario es
fulano@gmail.com, confía en mí". El frontend solo nos entrega el token que
Google/Facebook le dieron al usuario, y aquí lo verificamos directamente
contra los servidores de Google/Facebook antes de creer una sola palabra.

Variables de entorno necesarias (ver .env.example):
    GOOGLE_CLIENT_ID
    FACEBOOK_APP_ID
    FACEBOOK_APP_SECRET
"""

import os

import requests
from dotenv import load_dotenv
from fastapi import HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from core.config import ENV_FILE

# El `.env` ahora vive en la raíz del proyecto unificado (no en backend/).
# Se carga aquí porque este módulo lee las variables en el momento de
# importarse (no dentro de funciones).
load_dotenv(ENV_FILE)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")

ERROR_NO_CONFIGURADO = HTTPException(
    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
    detail=(
        "El inicio de sesión con este proveedor no está configurado en el "
        "servidor. Revisa las variables de entorno en el .env del backend."
    ),
)

ERROR_TOKEN_INVALIDO = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="No se pudo verificar la identidad con el proveedor. Intenta de nuevo.",
)


class DatosIdentidad:
    """Datos mínimos y ya verificados que necesitamos para crear/loguear al usuario."""

    def __init__(self, proveedor: str, proveedor_id: str, email: str,
                 nombre: str, apellido: str, avatar_url: str | None):
        self.proveedor = proveedor
        self.proveedor_id = proveedor_id
        self.email = email
        self.nombre = nombre
        self.apellido = apellido
        self.avatar_url = avatar_url


def verificar_google(credential: str) -> DatosIdentidad:
    """
    Verifica el "ID token" (JWT) que entrega Google Identity Services en el
    navegador. La librería `google-auth` valida la firma criptográfica
    contra las llaves públicas de Google y que el token sea para nuestra
    aplicación (audience = GOOGLE_CLIENT_ID).
    """
    if not GOOGLE_CLIENT_ID:
        raise ERROR_NO_CONFIGURADO

    try:
        datos = google_id_token.verify_oauth2_token(
            credential, google_requests.Request(), GOOGLE_CLIENT_ID
        )
    except Exception:
        raise ERROR_TOKEN_INVALIDO

    if datos.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise ERROR_TOKEN_INVALIDO

    email = datos.get("email")
    if not email or not datos.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tu cuenta de Google no tiene el correo verificado.",
        )

    return DatosIdentidad(
        proveedor="google",
        proveedor_id=datos["sub"],
        email=email,
        nombre=datos.get("given_name") or datos.get("name") or "Usuario",
        apellido=datos.get("family_name") or "Google",
        avatar_url=datos.get("picture"),
    )


def verificar_facebook(access_token: str) -> DatosIdentidad:
    """
    Verifica el access token que entrega el SDK de Facebook en el navegador.

    Dos pasos, ambos contra la API real de Facebook (nunca confiamos en el
    frontend):
      1. `debug_token`: confirma que el token es válido y que fue emitido
         para NUESTRA app (evita que alguien nos mande el token de otra app).
      2. `/me`: con el token ya confiado, se piden los datos del perfil.
    """
    if not (FACEBOOK_APP_ID and FACEBOOK_APP_SECRET):
        raise ERROR_NO_CONFIGURADO

    app_token = f"{FACEBOOK_APP_ID}|{FACEBOOK_APP_SECRET}"

    try:
        depuracion = requests.get(
            "https://graph.facebook.com/debug_token",
            params={"input_token": access_token, "access_token": app_token},
            timeout=8,
        ).json()
    except requests.RequestException:
        raise ERROR_TOKEN_INVALIDO

    info = depuracion.get("data", {})
    if not info.get("is_valid") or str(info.get("app_id")) != str(FACEBOOK_APP_ID):
        raise ERROR_TOKEN_INVALIDO

    try:
        perfil = requests.get(
            "https://graph.facebook.com/me",
            params={
                "fields": "id,first_name,last_name,email,picture.type(large)",
                "access_token": access_token,
            },
            timeout=8,
        ).json()
    except requests.RequestException:
        raise ERROR_TOKEN_INVALIDO

    if "error" in perfil or not perfil.get("id"):
        raise ERROR_TOKEN_INVALIDO

    email = perfil.get("email")
    if not email:
        # Puede pasar si el usuario inició sesión con celular y sin correo
        # verificado en Facebook, o si no concedió el permiso "email".
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Tu cuenta de Facebook no tiene un correo disponible. "
                "Agrega un correo a tu cuenta de Facebook o inicia sesión con email y contraseña."
            ),
        )

    avatar = (perfil.get("picture") or {}).get("data", {}).get("url")

    return DatosIdentidad(
        proveedor="facebook",
        proveedor_id=perfil["id"],
        email=email,
        nombre=perfil.get("first_name") or "Usuario",
        apellido=perfil.get("last_name") or "Facebook",
        avatar_url=avatar,
    )
