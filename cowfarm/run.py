#!/usr/bin/env python3
"""
run.py — Controlador único del proyecto CowFarm (backend + frontend en uno solo).

Antes había dos proyectos que se levantaban por separado (una carpeta para el
backend FastAPI y otra para el frontend React). Este script los une en una sola
pieza: un solo repositorio, un solo `.env`, un solo comando.

Comandos disponibles
--------------------
    python run.py              Levanta backend (API) + frontend (Vite) a la vez.
    python run.py instalar     Prepara el entorno: crea .venv, instala las
                               dependencias del backend y del frontend.
    python run.py backend       Levanta sólo la API (http://127.0.0.1:8000).
    python run.py frontend      Levanta sólo el frontend (http://localhost:5173).
    python run.py build         Compila el frontend a `frontend/dist`.
    python run.py prod          Compila el frontend y lo sirve desde el propio
                               backend: todo en un solo proceso y un solo puerto.
    python run.py db            Importa la base de datos (`database/127_0_0_1.sql`).

Opciones
--------
    --port N          Puerto del backend (por defecto 8000).
    --frontend-port N Puerto del frontend en modo desarrollo (por defecto 5173).
    --sin-vm          Usar el Python actual en vez de la carpeta `.venv`.

No requiere ninguna librería externa: sólo la biblioteca estándar de Python.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path

# Salida línea a línea (así los logs se ven en vivo aunque se redirijan a un archivo).
try:
    sys.stdout.reconfigure(line_buffering=True)
except AttributeError:  # pragma: no cover
    pass

# --- Rutas del proyecto unificado -------------------------------------------
ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"
DATABASE_DIR = ROOT / "database"
VENV_DIR = ROOT / ".venv"
ENV_FILE = ROOT / ".env"
ENV_EXAMPLE = ROOT / ".env.example"
SQL_FILE = DATABASE_DIR / "127_0_0_1.sql"

# --- Colores (se desactivan si la salida no es una terminal) ----------------
COLOR = sys.stdout.isatty()


def _c(color: str, texto: str) -> str:
    return f"\033[{color}m{texto}\033[0m" if COLOR else texto


AZUL = lambda t: _c("36", t)      # noqa: E731
VERDE = lambda t: _c("32", t)     # noqa: E731
AMARILLO = lambda t: _c("33", t)  # noqa: E731
ROJO = lambda t: _c("31", t)      # noqa: E731
GRIS = lambda t: _c("90", t)      # noqa: E731


def titulo(texto: str) -> None:
    print()
    print(AZUL("=" * 68))
    print(AZUL(f"  {texto}"))
    print(AZUL("=" * 68))


def aviso(texto: str) -> None:
    print(AMARILLO(f"⚠  {texto}"))


def error(texto: str) -> None:
    print(ROJO(f"✖ {texto}"))


def ok(texto: str) -> None:
    print(VERDE(f"✔ {texto}"))


# --- Utilidades --------------------------------------------------------------
def interprete_venv() -> Path:
    """Ruta del intérprete dentro de la carpeta `.venv` (sistema operativo)."""
    return VENV_DIR / ("Scripts/python.exe" if os.name == "nt" else "bin/python")


def python_del_venv() -> str:
    """Ruta del intérprete de la carpeta `.venv` (o el Python actual)."""
    return str(interprete_venv()) if interprete_venv().exists() else sys.executable


def dentro_del_venv() -> bool:
    """¿Estamos ya corriendo con el intérprete de la carpeta `.venv`?"""
    if not interprete_venv().exists():
        return False
    return Path(sys.executable).resolve() == Path(interprete_venv()).resolve()


def npm() -> str | None:
    return shutil.which("npm") or shutil.which("npm.cmd")


def asegurar_env() -> None:
    """Si falta el `.env`, lo crea a partir de `.env.example`."""
    if ENV_FILE.exists():
        return
    if ENV_EXAMPLE.exists():
        shutil.copyfile(ENV_EXAMPLE, ENV_FILE)
        ok(f"Se creó {ENV_FILE.name} a partir de {ENV_EXAMPLE.name} (ajusta los valores).")
    else:
        aviso(f"No se encontró {ENV_FILE.name} ni {ENV_EXAMPLE.name}.")


def asegurar_venv() -> str:
    """Crea la carpeta `.venv` si no existe y devuelve su intérprete."""
    if dentro_del_venv():
        return sys.executable

    if not interprete_venv().exists():
        ok("Creando el entorno virtual .venv ...")
        subprocess.check_call([sys.executable, "-m", "venv", str(VENV_DIR)])

    return python_del_venv()


def ejecutar(comando: list[str], cwd: Path) -> int:
    """Ejecuta un comando mostrando su salida en vivo."""
    print(GRIS(f"$ {' '.join(comando)}  (en {cwd})"))
    proceso = subprocess.run(comando, cwd=str(cwd))
    return proceso.returncode


def leer_variables_env() -> dict[str, str]:
    """Lee el `.env` de la raíz sin depender de python-dotenv."""
    valores: dict[str, str] = {}
    if not ENV_FILE.exists():
        return valores
    for linea in ENV_FILE.read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if not linea or linea.startswith("#") or "=" not in linea:
            continue
        clave, _, valor = linea.partition("=")
        valores[clave.strip()] = valor.strip()
    return valores


# --- Instalación -------------------------------------------------------------
def instalar() -> int:
    """Deja el proyecto listo para arrancar: `.venv` + dependencias + node_modules."""
    titulo("Instalando las dependencias de CowFarm")
    asegurar_env()

    # 1) Backend
    try:
        interprete = asegurar_venv()
    except subprocess.CalledProcessError:
        error("No se pudo crear la carpeta .venv (instala python3-venv).")
        return 1

    requirements = BACKEND_DIR / "requirements.txt"
    if requirements.exists():
        ok("Instalando las dependencias del backend ...")
        # Actualizar pip es una comodidad, no un requisito: si falla (sin red,
        # por ejemplo) se sigue adelante con el pip que ya exista.
        try:
            subprocess.check_call([interprete, "-m", "pip", "install", "--upgrade", "pip"],
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except (subprocess.CalledProcessError, OSError):
            aviso("No se pudo actualizar pip (se continúa con el actual).")
        try:
            subprocess.check_call([interprete, "-m", "pip", "install", "-r", str(requirements)])
        except subprocess.CalledProcessError:
            error("Falló la instalación de las dependencias del backend.")
            return 1
    else:
        aviso("No se encontró backend/requirements.txt")

    # 2) Frontend
    herramienta_npm = npm()
    if herramienta_npm is None:
        aviso("No se encontró 'npm'. Instala Node.js 18+ para usar el frontend.")
        return 1
    ok("Instalando las dependencias del frontend (npm install) ...")
    return ejecutar([herramienta_npm, "install"], FRONTEND_DIR)


def backend_instalado() -> bool:
    try:
        subprocess.check_call(
            [python_del_venv(), "-c", "import uvicorn, fastapi, sqlalchemy"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return True
    except (subprocess.CalledProcessError, OSError):
        return False


# --- Arranque de los dos servidores ------------------------------------------
class Servidor:
    """Un proceso hijo (backend o frontend) con su salida etiquetada."""

    def __init__(self, comando: list[str], cwd: Path, etiqueta: str, color: str):
        self.etiqueta = etiqueta
        self.color = color
        self.comando = comando
        self.cwd = cwd
        self.proceso: subprocess.Popen | None = None
        self.hilo: threading.Thread | None = None

    def iniciar(self) -> None:
        print(GRIS(f"$ {' '.join(self.comando)}  (en {self.cwd})"))
        self.proceso = subprocess.Popen(
            self.comando,
            cwd=str(self.cwd),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
        )
        self.hilo = threading.Thread(target=self._escuchar, daemon=True)
        self.hilo.start()

    def _escuchar(self) -> None:
        assert self.proceso is not None and self.proceso.stdout is not None
        for linea in self.proceso.stdout:
            print(f"{self.color}[{self.etiqueta}]{_c('0', '')} {linea.rstrip()}")

    def detener(self) -> None:
        if self.proceso is None or self.proceso.poll() is not None:
            return
        print(GRIS(f"Deteniendo {self.etiqueta} ..."))
        try:
            self.proceso.terminate()
            self.proceso.wait(timeout=10)
        except Exception:
            try:
                self.proceso.kill()
            except Exception:
                pass


def servidor_backend(puerto: int, recarga: bool = True, sin_vm: bool = False) -> Servidor:
    interprete = sys.executable if sin_vm else python_del_venv()
    comando = [interprete, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", str(puerto)]
    if recarga:
        comando.append("--reload")
    return Servidor(comando, BACKEND_DIR, "API", AZUL(""))


def servidor_frontend(puerto: int) -> Servidor:
    herramienta_npm = npm()
    if herramienta_npm is None:
        error("No se encontró 'npm'. Instala Node.js 18+ para usar el frontend.")
        raise SystemExit(1)
    return Servidor(
        [herramienta_npm, "run", "dev", "--", "--port", str(puerto), "--strictPort"],
        FRONTEND_DIR,
        "WEB",
        VERDE(""),
    )


def esperar(servidores: list[Servidor]) -> int:
    """Espera a que termine cualquiera de los servidores (o a Ctrl+C)."""
    print()
    ok("CowFarm está corriendo. Ctrl+C para detener todo.")
    try:
        while True:
            for servidor in servidores:
                if servidor.proceso is not None and servidor.proceso.poll() is not None:
                    aviso(f"{servidor.etiqueta} se detuvo (código {servidor.proceso.returncode}).")
                    return servidor.proceso.returncode or 0
            time.sleep(0.4)
    except KeyboardInterrupt:
        print()
        aviso("Deteniendo CowFarm ...")
        return 0
    finally:
        for servidor in servidores:
            servidor.detener()


# --- Comandos ----------------------------------------------------------------
def cmd_desarrollo(puerto: int, puerto_frontend: int, sin_vm: bool) -> int:
    titulo("Levantando CowFarm completo (API + Frontend)")
    asegurar_env()

    if not sin_vm and not backend_instalado():
        aviso("Faltan las dependencias del backend. Instalando ...")
        if instalar() != 0:
            return 1

    if not (FRONTEND_DIR / "node_modules").exists():
        if npm() is None:
            error("Falta Node.js: instálalo (18+) o usa 'python run.py backend'.")
            return 1
        aviso("Falta node_modules. Instalando las dependencias del frontend ...")
        if ejecutar([npm(), "install"], FRONTEND_DIR) != 0:
            return 1

    servidores = [servidor_backend(puerto, recarga=True, sin_vm=sin_vm)]
    herramienta_npm = npm()
    if herramienta_npm:
        servidores.append(servidor_frontend(puerto_frontend))

    for servidor in servidores:
        servidor.iniciar()

    print()
    print(GRIS(f"  API      ->  http://127.0.0.1:{puerto}"))
    print(GRIS(f"  Documentación ->  http://127.0.0.1:{puerto}/docs"))
    print(GRIS(f"  Frontend ->  http://localhost:{puerto_frontend}"))
    return esperar(servidores)


def cmd_backend(puerto: int, sin_vm: bool) -> int:
    titulo("Levantando sólo el backend (API)")
    asegurar_env()
    if not sin_vm and not backend_instalado():
        aviso("Faltan las dependencias del backend. Instalando ...")
        if instalar() != 0:
            return 1
    servidor = servidor_backend(puerto, recarga=True, sin_vm=sin_vm)
    servidor.iniciar()
    print()
    print(GRIS(f"  API -> http://127.0.0.1:{puerto}   |   Documentación -> /docs"))
    return esperar([servidor])


def cmd_frontend(puerto: int) -> int:
    titulo("Levantando sólo el frontend (Vite)")
    if not (FRONTEND_DIR / "node_modules").exists():
        if npm() is None:
            error("No se encontró 'npm'. Instala Node.js 18+.")
            return 1
        if ejecutar([npm(), "install"], FRONTEND_DIR) != 0:
            return 1
    servidor = servidor_frontend(puerto)
    servidor.iniciar()
    print()
    print(GRIS(f"  Frontend -> http://localhost:{puerto}"))
    return esperar([servidor])


def cmd_build() -> int:
    titulo("Compilando el frontend (frontend/dist)")
    if npm() is None:
        error("No se encontró 'npm'. Instala Node.js 18+.")
        return 1
    if not (FRONTEND_DIR / "node_modules").exists():
        if ejecutar([npm(), "install"], FRONTEND_DIR) != 0:
            return 1
    codigo = ejecutar([npm(), "run", "build"], FRONTEND_DIR)
    if codigo == 0:
        ok("Frontend compilado en frontend/dist")
    return codigo


def cmd_prod(puerto: int, sin_vm: bool) -> int:
    titulo("Modo producción: un solo servidor con todo el proyecto")
    asegurar_env()

    if not (FRONTEND_DIR / "dist").exists():
        if cmd_build() != 0:
            return 1

    if not sin_vm and not backend_instalado():
        aviso("Faltan las dependencias del backend. Instalando ...")
        if instalar() != 0:
            return 1

    print()
    ok("El backend sirvirá la API y la aplicación React compilada.")
    print(GRIS(f"  Todo en  ->  http://127.0.0.1:{puerto}"))
    servidor = servidor_backend(puerto, recarga=False, sin_vm=sin_vm)
    servidor.iniciar()
    return esperar([servidor])


def cmd_db() -> int:
    titulo("Importando la base de datos de CowFarm")
    asegurar_env()

    if not SQL_FILE.exists():
        error(f"No se encontró el script SQL: {SQL_FILE}")
        return 1

    cliente = shutil.which("mysql") or shutil.which("mariadb")
    if cliente is None:
        error("No se encontró el cliente 'mysql' en el PATH.")
        print()
        print("Importa el script manualmente con:")
        print(GRIS(f"  mysql -u root -p < {SQL_FILE.name}"))
        return 1

    variables = leer_variables_env()
    entorno = dict(os.environ)
    contrasena = variables.get("DB_PASSWORD", "")
    if contrasena:
        # MYSQL_PWD evita que la contraseña aparezca en la lista de procesos.
        entorno["MYSQL_PWD"] = contrasena

    comando = [
        cliente,
        "-h", variables.get("DB_HOST", "localhost"),
        "-P", variables.get("DB_PORT", "3306"),
        "-u", variables.get("DB_USER", "root"),
    ]

    titulo(f"Importando {SQL_FILE.name} en la base '{variables.get('DB_NAME', 'cowfarm')}'")
    with open(SQL_FILE, "r", encoding="utf-8") as archivo:
        proceso = subprocess.run(
            comando,
            stdin=archivo,
            env=entorno,
            cwd=str(DATABASE_DIR),
        )
    if proceso.returncode == 0:
        ok("Base de datos importada correctamente.")
    else:
        error("Falló la importación de la base de datos.")
    return proceso.returncode


# --- Entrada principal -------------------------------------------------------
def main() -> int:
    analizador = argparse.ArgumentParser(
        prog="run.py",
        description="Controlador único de CowFarm (backend FastAPI + frontend React).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    analizador.add_argument(
        "comando",
        nargs="?",
        default="dev",
        help="dev | install | backend | frontend | build | prod | db",
    )
    analizador.add_argument("--port", type=int, default=8000, help="Puerto del backend")
    analizador.add_argument("--frontend-port", type=int, default=5173, help="Puerto del frontend")
    analizador.add_argument("--sin-vm", action="store_true", help="Usar el Python actual sin .venv")
    argumentos = analizador.parse_args()

    comando = (argumentos.comando or "dev").lower()

    if comando in ("dev", "start", "all"):
        return cmd_desarrollo(argumentos.port, argumentos.frontend_port, argumentos.sin_vm)
    if comando in ("install", "instalar", "setup"):
        return instalar()
    if comando in ("backend", "api"):
        return cmd_backend(argumentos.port, argumentos.sin_vm)
    if comando in ("frontend", "web"):
        return cmd_frontend(argumentos.frontend_port)
    if comando in ("build", "compilar"):
        return cmd_build()
    if comando in ("prod", "production"):
        return cmd_prod(argumentos.port, argumentos.sin_vm)
    if comando in ("db", "database", "base-datos"):
        return cmd_db()

    error(f"Comando desconocido: '{comando}'")
    analizador.print_help()
    return 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print()
        aviso("CowFarm detenido.")
        sys.exit(0)
