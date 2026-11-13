import os
import hashlib
from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv

from core.config import ENV_FILE

# El `.env` ahora vive en la raíz del proyecto unificado (no en backend/).
load_dotenv(ENV_FILE)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

if not SECRET_KEY:
    raise RuntimeError(
        "❌ ERROR CRÍTICO DE CONFIGURACIÓN: La variable 'SECRET_KEY' no está definida en el archivo .env."
    )

EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 525600))


def hash_password(password: str) -> str:
    """Hashea la contraseña con PBKDF2-HMAC-SHA256 y una sal aleatoria."""
    salt = os.urandom(16).hex()
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 260000)
    return f"{salt}${hashed.hex()}"


def verify_password(plain: str, stored: str) -> bool:
    """Verifica la contraseña comparando el hash almacenado con el derivado del texto plano."""
    try:
        salt, hashed = stored.split("$")
        nuevo_hash = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt.encode(), 260000).hex()
        return nuevo_hash == hashed
    except Exception:
        return False


def create_access_token(data: dict) -> str:
    """Genera un JWT firmado que incluye fecha de expiración."""
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decodifica y valida la firma de un JWT."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
