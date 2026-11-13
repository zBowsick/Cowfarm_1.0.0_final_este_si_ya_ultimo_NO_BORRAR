# CowFarm — Proyecto unificado (backend + frontend)

Sistema agrícola para campesinos colombianos. Este repositorio contiene **las
dos mitades de la aplicación en una sola pieza**:

- **Backend** — API REST en **FastAPI** + SQLAlchemy + MariaDB/MySQL
  (autenticación JWT, login social, catálogo, pedidos, pagos, ventas, cargas
  de imágenes y formulario de contacto).
- **Frontend** — SPA en **React 19 + Vite** (páginas públicas, login/registro,
  panel de administración, publicación de productos y cuenta del usuario).

Todo funciona exactamente igual que cuando eran dos proyectos separados, pero
ahora hay **un solo repositorio, un solo `.env` y un solo comando**.

---

## Inicio rápido

```bash
# 1) Prepara el entorno (crea .venv, instala backend y frontend)
python run.py instalar

# 2) Levanta TODO: API + Frontend
python run.py
```

- Frontend → <http://localhost:5173>
- API → <http://127.0.0.1:8000>  ·  Documentación → <http://127.0.0.1:8000/docs>

> `python run.py` detecta lo que falte (dependencias del backend, `node_modules`)
> y lo instala solo antes de arrancar.

---

## Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Python | 3.10+ | API (FastAPI) |
| Node.js | 18+ | Frontend (Vite) |
| MariaDB / MySQL | 10.4+ | Base de datos `cowfarm` |

---

## Estructura

```
cowfarm/
├── run.py                 ← Controlador único (instalar, levantar, compilar, importar la BD)
├── .env                   ← Configuración ÚNICA (backend + frontend)
├── .env.example           ← Plantilla de configuración
├── LOGIN_SOCIAL.md        ← Cómo activar el login con Google y Facebook
├── database/
│   └── 127_0_0_1.sql      ← Script de la base de datos (datos + tablas + usuarios)
├── backend/               ← API FastAPI
│   ├── main.py            ← Aplicación, CORS, cabeceras de seguridad, /uploads
│   ├── requirements.txt
│   ├── core/              ← base de datos, seguridad, OAuth, correos, subidas, migraciones
│   ├── models/            ← Modelos SQLAlchemy
│   ├── schemas/           ← Esquemas Pydantic
│   ├── routers/           ← Endpoints de la API
│   ├── services/          ← Lógica de negocio
│   └── uploads/           ← Imágenes subidas (productos y categorías)
└── frontend/              ← SPA React + Vite
    ├── package.json
    ├── vite.config.js     ← Lee el `.env` de la raíz del proyecto
    ├── index.html
    ├── public/            ← Imágenes y estilos estáticos
    └── src/               ← Páginas, componentes, contexto, hooks y cliente de la API
```

---

## Comandos

| Comando | Qué hace |
|---|---|
| `python run.py` | Levanta la API y el frontend a la vez (modo desarrollo). |
| `python run.py instalar` | Crea `.venv` e instala las dependencias del backend y del frontend. |
| `python run.py backend` | Levanta sólo la API (`http://127.0.0.1:8000`). |
| `python run.py frontend` | Levanta sólo el frontend (`http://localhost:5173`). |
| `python run.py build` | Compila el frontend a `frontend/dist`. |
| `python run.py prod` | Compila el frontend y lo sirve **desde el backend**: todo en un solo proceso y un solo puerto (`http://127.0.0.1:8000`). |
| `python run.py db` | Importa `database/127_0_0_1.sql` en MariaDB/MySQL. |

Opciones: `--port N` (puerto de la API), `--frontend-port N` (puerto de Vite),
`--sin-vm` (usar el Python actual en vez de la carpeta `.venv`).

---

## Base de datos

1. Crea la base vacía en MariaDB/MySQL:

   ```sql
   CREATE DATABASE cowfarm CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   ```

2. Importa los datos y las tablas:

   ```bash
   python run.py db
   # o manualmente:
   #   mysql -u root -p < database/127_0_0_1.sql
   ```

   El script `database/127_0_0_1.sql` incluye las tablas, los datos de
   ejemplo y el usuario administrador.

3. Al arrancar la API, `create_all()` crea las tablas que falten y
   `aplicar_migraciones()` agrega las columnas nuevas (`categorias.slug`,
   `categorias.descripcion`, `categorias.imagen_url`,
   `usuarios.proveedor_auth`, `usuarios.proveedor_id`, `usuarios.avatar_url`).
   Es idempotente: se puede arrancar el servidor las veces que quieras.

---

## Configuración (`.env`)

Un solo archivo para las dos partes. Las variables que empiezan por `VITE_`
son las **únicas** que llegan al navegador.

### Base de datos

| Variable | Por defecto | Descripción |
|---|---|---|
| `DB_USER` | `root` | Usuario de MariaDB/MySQL. |
| `DB_PASSWORD` | *(vacío)* | Contraseña de la base de datos. |
| `DB_HOST` | `localhost` | Servidor de la base de datos. |
| `DB_PORT` | `3306` | Puerto de la base de datos. |
| `DB_NAME` | `cowfarm` | Nombre de la base de datos. |

### Seguridad / JWT

| Variable | Por defecto | Descripción |
|---|---|---|
| `SECRET_KEY` | *(obligatoria)* | Clave para firmar los tokens JWT. Genera una con `python -c "import secrets; print(secrets.token_hex(32))"`. |
| `ALGORITHM` | `HS256` | Algoritmo de firma. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `525600` | Vigencia del token (1 año). |

### CORS

| Variable | Descripción |
|---|---|
| `ALLOWED_ORIGINS` | **Obligatoria.** Orígenes del frontend separados por coma. Si falta, el backend no arranca (fallo seguro). Ya incluye `http://localhost:5173` y `http://127.0.0.1:5173`. |

### Frontend (Vite)

| Variable | Por defecto | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | URL base de la API. Déjala **vacía** (`VITE_API_BASE_URL=`) en producción para que las llamadas sean relativas al mismo origen. |
| `VITE_GOOGLE_CLIENT_ID` | *(el configurado)* | Debe ser el **mismo** Client ID que `GOOGLE_CLIENT_ID`. |
| `VITE_FACEBOOK_APP_ID` | *(vacío)* | Debe ser el mismo ID de app que `FACEBOOK_APP_ID`. |

### Login social y correo

| Variable | Descripción |
|---|---|
| `GOOGLE_CLIENT_ID` | Client ID de Google (ver `LOGIN_SOCIAL.md`). |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Credenciales de Facebook. El secreto **nunca** va en el frontend. |
| `SMTP_HOST` / `SMTP_PORT` | Servidor SMTP (por defecto Gmail en el puerto 587). |
| `SMTP_USER` / `SMTP_PASSWORD` | Cuenta que envía el correo del formulario de contacto. En Gmail usa una *contraseña de aplicación*. |
| `CONTACT_EMAIL_TO` | Correo donde llegan los mensajes del formulario de contacto. |

---

## API (backend)

Todos los endpoints cuelgan de `http://127.0.0.1:8000` y la documentación
interactiva está en `/docs`.

| Prefijo | Contenido |
|---|---|
| `/auth` | Login con usuario y contraseña, login con Google, login con Facebook. |
| `/usuarios` | Registro, perfil, listado, cambio de rol, eliminación. |
| `/direcciones` | Direcciones de envío por usuario. |
| `/categorias` | Catálogo de categorías (con imagen de portada). |
| `/productos` | Catálogo de productos y filtros. |
| `/producto-imagenes` | Registro y carga de imágenes (una o varias). |
| `/pedidos` | Pedidos, cambio de estado, asignación de distribuidor. |
| `/detalle-pedido` | Detalle (ítems) de cada pedido. |
| `/pagos` | Pagos asociados a un pedido. |
| `/ventas` | Historial de ventas. |
| `/proveedores` | Proveedores. |
| `/metodos-pago` | Métodos de pago disponibles. |
| `/contacto` | Envío del formulario de contacto por correo (SMTP). |
| `/uploads/...` | Archivos subidos (imágenes de productos y categorías). |

---

## Frontend (React)

| Ruta | Página |
|---|---|
| `/` | Login / Registro. |
| `/home` | Home. |
| `/nosotros` | Nosotros. |
| `/servicios` | Servicios. |
| `/contacto` | Contacto (formulario conectado al backend por SMTP). |
| `/categorias` | Listado de todas las categorías. |
| `/categoria/:slug` | Catálogo de una categoría (ej. `/categoria/frutas-frescas`). |
| `/ganado`, `/insumos`, `/cultivos` | Compatibilidad con los enlaces antiguos. |
| `/publicar` | Publicar producto (sólo rol `vendedor`). |
| `/admin` | Panel de administración (sólo rol `administrador`). |
| `/cuenta` | Cuenta del usuario. |

---

## Producción (un solo servidor)

```bash
python run.py build   # compila el frontend a frontend/dist
python run.py prod    # el backend sirve la API + la app React en el mismo puerto
```

- App + API → <http://127.0.0.1:8000>
- Documentación → <http://127.0.0.1:8000/docs>

Cuando el frontend se sirve desde el mismo origen, deja
`VITE_API_BASE_URL=` (vacía) en el `.env` **antes** de compilar, para que las
llamadas a la API usen rutas relativas y no dependan del dominio.

---

## Qué cambió al unificar los dos proyectos

Los dos proyectos anteriores (`cowfarm-backend` y `cowfarm-frontend-react`)
se fusionaron en esta única carpeta. **Ninguna funcionalidad se perdió ni se
cambió**: el código de la API, los modelos, los servicios, las páginas React,
los estilos y los scripts de login social son los mismos.

| Antes | Ahora |
|---|---|
| `cowfarm-backend/` y `cowfarm-frontend-react/` (dos carpetas) | Una sola carpeta `cowfarm/` con `backend/` y `frontend/` dentro. |
| `backend/.env` + `frontend/.env` (dos archivos) | Un solo `.env` en la raíz. |
| `uvicorn main:app --reload` + `npm run dev` (dos terminales) | `python run.py` (un solo comando). |
| `npm install` + `pip install` por separado | `python run.py instalar`. |
| Sin forma de servir todo desde un solo servidor | `python run.py prod` (API + React en un solo proceso y puerto). |
| `cowfarm_mariadb.sql` sin ubicarse | `database/127_0_0_1.sql` dentro del proyecto + `python run.py db`. |

Cambios técnicos mínimos y verificables:

- `backend/core/config.py` (nuevo): resuelve la raíz del proyecto y carga el
  `.env` único, para que el backend lo encuentre sin importar desde dónde se
  ejecute.
- `backend/core/database.py`, `core/security.py`, `core/oauth.py`: cargan el
  `.env` de la raíz en vez del de `backend/`.
- `backend/main.py`: monta la app React compilada (`frontend/dist`) cuando
  existe, **después** de registrar los routers de la API para no interferir
  con ningún endpoint. Sin `dist` el comportamiento es idéntico al anterior.
- `frontend/vite.config.js`: `envDir: '..'` para leer el `.env` de la raíz.
- `frontend/src/lib/api.js`: `VITE_API_BASE_URL` ahora acepta valor vacío
  (llamadas relativas) en producción; con el valor por defecto se comporta
  exactamente igual que antes.

---

## Problemas frecuentes

**"❌ ERROR CRITICO: Configura ALLOWED_ORIGINS..."**
Falta `ALLOWED_ORIGINS` en el `.env`. Añade los orígenes de tu frontend.

**"No se pudo conectar con el servidor. ¿Está el backend corriendo?"**
La API no está arriba. Levanta todo con `python run.py` o sólo la API con
`python run.py backend`.

**El login con Google/Facebook aparece deshabilitado**
Faltan `VITE_GOOGLE_CLIENT_ID` / `VITE_FACEBOOK_APP_ID` (mismo valor que en
el backend). Revisa `LOGIN_SOCIAL.md`.

**El formulario de contacto no llega**
Revisa `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` (en Gmail, una
*contraseña de aplicación*) y `CONTACT_EMAIL_TO`.

**Faltan las tablas o las categorías**
Importa la base de datos: `python run.py db`.
