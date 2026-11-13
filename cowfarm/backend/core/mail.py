"""
Envío de correos por SMTP (usado por el formulario de Contacto).

Configuración por variables de entorno (ver .env):
  SMTP_HOST       - servidor SMTP (ej. smtp.gmail.com)
  SMTP_PORT       - puerto SMTP (587 para TLS)
  SMTP_USER       - cuenta que autentica y envía el correo
  SMTP_PASSWORD   - contraseña o "contraseña de aplicación" de esa cuenta
  CONTACT_EMAIL_TO - a qué correo llegan los mensajes del formulario de
                      contacto (por defecto cowfarmcolombia@gmail.com)

Si usas Gmail: la cuenta SMTP_USER necesita una "contraseña de aplicación"
(no la contraseña normal de la cuenta). Se genera en:
https://myaccount.google.com/apppasswords
(requiere tener activada la verificación en dos pasos).
"""

import os
import smtplib
from email.message import EmailMessage

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
CONTACT_EMAIL_TO = os.getenv("CONTACT_EMAIL_TO", "cowfarmcolombia@gmail.com")


class ErrorEnvioCorreo(Exception):
    """Se lanza cuando el correo no se pudo enviar (SMTP no configurado o falló)."""


def enviar_correo_contacto(nombre: str, email_remitente: str, mensaje: str) -> None:
    if not SMTP_USER or not SMTP_PASSWORD:
        raise ErrorEnvioCorreo(
            "El envío de correo no está configurado en el servidor "
            "(faltan SMTP_USER / SMTP_PASSWORD en el .env)."
        )

    correo = EmailMessage()
    correo["Subject"] = f"Nuevo mensaje de contacto de {nombre} — CowFarm"
    correo["From"] = SMTP_USER
    correo["To"] = CONTACT_EMAIL_TO
    # Para poder responder directo al cliente desde el correo del gestor.
    correo["Reply-To"] = email_remitente
    correo.set_content(
        f"Nuevo mensaje desde el formulario de contacto de CowFarm.\n\n"
        f"Nombre: {nombre}\n"
        f"Correo: {email_remitente}\n\n"
        f"Mensaje:\n{mensaje}\n"
    )

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as servidor:
            servidor.starttls()
            servidor.login(SMTP_USER, SMTP_PASSWORD)
            servidor.send_message(correo)
    except Exception as err:  # noqa: BLE001 - queremos capturar cualquier fallo de red/SMTP
        raise ErrorEnvioCorreo(f"No se pudo enviar el correo: {err}") from err
