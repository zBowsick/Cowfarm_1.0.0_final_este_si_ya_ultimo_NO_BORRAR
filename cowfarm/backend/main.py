import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from core.config import ENV_FILE, FRONTEND_DIST
from core.database import Base, engine
from core.db_migrations import aplicar_migraciones
from core.uploads import UPLOAD_ROOT, URL_PREFIX

import models  # registra todos los modelos para que create_all los detecte
from routers import register_routers

# El `.env` ahora vive en la raíz del proyecto unificado (no en backend/).
load_dotenv(ENV_FILE)

Base.metadata.create_all(bind=engine)

# Agrega columnas nuevas (categorias.slug, .descripcion, .imagen_url) a las
# tablas que ya existían. Es seguro ejecutarlo en cada arranque.
aplicar_migraciones()

app = FastAPI(
    title="CowFarm API",
    description="Sistema agrícola para campesinos colombianos",
    version="1.0.0",
)

# --- Cabeceras de seguridad ---
# IMPORTANTE: este middleware se registra ANTES que CORSMiddleware para que
# quede "por dentro" y no intercepte (ni rompa) la respuesta de preflight de CORS.
@app.middleware("http")
async def anadir_cabeceras_seguridad(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"            # Evita Clickjacking
    response.headers["X-Content-Type-Options"] = "nosniff"  # Evita ejecución de archivos falsos
    # Las imágenes subidas se muestran desde otro origen (el frontend en
    # localhost:5173), así que necesitan permiso explícito para incrustarse.
    if request.url.path.startswith(f"{URL_PREFIX}/"):
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
        response.headers["Cache-Control"] = "public, max-age=31536000"
    return response


# --- Control de Red (CORS de falla segura) ---
origins_raw = os.getenv("ALLOWED_ORIGINS")
if not origins_raw:
    raise RuntimeError("❌ ERROR CRITICO: Configura ALLOWED_ORIGINS en tu archivo .env antes de iniciar.")

LISTA_ORIGENES = [origen.strip() for origen in origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=LISTA_ORIGENES,  # Ya no más asteriscos peligrosos
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


# --- Archivos subidos (imágenes de productos y categorías) ---
# Quedan disponibles en http://<servidor>/uploads/productos/<archivo>
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
(UPLOAD_ROOT / "productos").mkdir(exist_ok=True)
(UPLOAD_ROOT / "categorias").mkdir(exist_ok=True)
app.mount(URL_PREFIX, StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")


register_routers(app)


@app.get("/api", include_in_schema=False)
def estado_api():
    """Estado de la API. Útil en el modo de un solo servidor, donde '/' lo
    ocupa la aplicación React compilada."""
    return {"message": "¡Bienvenido a CowFarm!", "api": "CowFarm API", "version": "1.0.0"}


# --- Frontend compilado: la app completa en UN solo servidor ---
# Si existe `frontend/dist` (después de `npm run build`), el backend también
# sirve la aplicación React: mismo proceso, mismo puerto, sin CORS.
#
# En modo desarrollo (sin `dist`) este bloque no hace nada y el proyecto se
# comporta exactamente igual que antes: la API por su lado y el frontend de
# Vite por el otro.
if FRONTEND_DIST.is_dir():
    from fastapi.responses import FileResponse
    from fastapi.routing import APIRoute

    # Prefijos reales de la API (auth, usuarios, productos, ...). Se calculan
    # de las rutas ya registradas para que nunca haya que mantenerlos a mano.
    PREFIJOS_API = {ruta.path.split("/")[1] for ruta in app.routes if isinstance(ruta, APIRoute)}
    PREFIJOS_API.discard("")

    @app.get("/{ruta_spa:path}", include_in_schema=False)
    def servir_frontend(ruta_spa: str):
        """Sirve la app React compilada, incluyendo las rutas del React Router."""
        if ruta_spa.split("/")[0] in PREFIJOS_API:
            # Es una ruta de la API que no existe: 404 normal, no el HTML.
            raise HTTPException(status_code=404, detail="Not Found")

        # Si la ruta es un archivo real de la compilación (js, css, imágenes),
        # se entrega tal cual.
        archivo = (FRONTEND_DIST / ruta_spa).resolve()
        if archivo.is_file() and str(archivo).startswith(str(FRONTEND_DIST.resolve())):
            return FileResponse(archivo)

        # Cualquier otra ruta es una ruta del React Router -> index.html
        return FileResponse(FRONTEND_DIST / "index.html")


@app.get("/")
def root():
    return {"message": "¡Bienvenido a CowFarm!"}
