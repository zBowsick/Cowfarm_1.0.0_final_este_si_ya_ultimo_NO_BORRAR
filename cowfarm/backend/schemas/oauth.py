from pydantic import BaseModel


class GoogleLoginRequest(BaseModel):
    # "ID token" (credential) que entrega Google Identity Services en el navegador.
    credential: str


class FacebookLoginRequest(BaseModel):
    # Access token que entrega el SDK de Facebook en el navegador.
    access_token: str
