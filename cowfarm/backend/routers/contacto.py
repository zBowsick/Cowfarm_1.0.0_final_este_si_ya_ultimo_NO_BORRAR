from fastapi import APIRouter, HTTPException, status

from schemas.contacto import ContactoCreate
from core.mail import enviar_correo_contacto, ErrorEnvioCorreo

router = APIRouter(prefix="/contacto", tags=["Contacto"])


@router.post("/", status_code=status.HTTP_204_NO_CONTENT)
def enviar_mensaje_contacto(data: ContactoCreate):
    """Recibe el formulario de 'Hablemos' y lo envía por correo al equipo de CowFarm."""
    try:
        enviar_correo_contacto(data.nombre, data.email, data.mensaje)
    except ErrorEnvioCorreo as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err),
        ) from err
