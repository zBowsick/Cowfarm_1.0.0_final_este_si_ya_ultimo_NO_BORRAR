"""
core/config.py — Configuración central del proyecto unificado CowFarm.

Define la raíz del proyecto (un nivel por encima de `backend/`) para que:

  1. El archivo `.env` ÚNICO de la raíz se cargue siempre, sin importar desde
     qué carpeta se ejecute `uvicorn` o desde qué carpeta se invoque Python.
     Antes cada parte tenía su propio `.env` (backend/.env y frontend/.env);
     ahora hay uno solo en la raíz del proyecto.

  2. Se localicen las carpetas hermanas del proyecto:
     `frontend/dist` (el frontend compilado) y `database/` (el script SQL).

No cambia ninguna variable de entorno ni ningún valor: el archivo `.env` de la
raiz contiene exactamente las mismas variables que antes, sólo que ahora en un
único lugar.
"""

from pathlib import Path

from dotenv import load_dotenv

# .../cowfarm/backend/core/config.py  ->  .../cowfarm/backend
BACKEND_DIR = Path(__file__).resolve().parent.parent

# .../cowfarm/backend  ->  .../cowfarm
ROOT_DIR = BACKEND_DIR.parent

# Archivo de configuración ÚNICO del proyecto (backend + frontend).
ENV_FILE = ROOT_DIR / ".env"

# Carpeta del frontend (React + Vite) y su carpeta de compilación.
FRONTEND_DIR = ROOT_DIR / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"

# Script SQL con la base de datos de CowFarm (MariaDB / MySQL).
SQL_FILE = ROOT_DIR / "database" / "127_0_0_1.sql"

# Carga el `.env` de la raíz. `override=False` mantiene el comportamiento de
# siempre: si una variable ya está definida en el entorno del sistema, esa
# gana; el archivo sólo rellena lo que falte.
load_dotenv(ENV_FILE)
