"""
core/db_migrations.py — Migraciones mínimas y seguras.

`Base.metadata.create_all()` crea tablas nuevas, pero NO agrega columnas a
tablas que ya existen. Como la tabla `categorias` ya está creada en tu base
de datos, aquí agregamos las columnas nuevas (slug, descripcion, imagen_url)
solo si todavía no existen.

Es idempotente: puedes arrancar el servidor las veces que quieras.
"""

from sqlalchemy import inspect, text

from core.database import engine

# tabla -> { columna: definición SQL }
COLUMNAS_NUEVAS = {
    "categorias": {
        "slug": "VARCHAR(120) NULL",
        "descripcion": "VARCHAR(500) NULL",
        "imagen_url": "VARCHAR(500) NULL",
    },
    "usuarios": {
        "proveedor_auth": "VARCHAR(20) NULL DEFAULT 'local'",
        "proveedor_id": "VARCHAR(255) NULL",
        "avatar_url": "VARCHAR(500) NULL",
    },
}


def _slugify(texto: str) -> str:
    import re
    import unicodedata

    texto = unicodedata.normalize("NFD", texto or "")
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    texto = re.sub(r"[^a-zA-Z0-9]+", "-", texto).strip("-").lower()
    return texto or "categoria"


def aplicar_migraciones() -> None:
    inspector = inspect(engine)

    with engine.begin() as conexion:
        for tabla, columnas in COLUMNAS_NUEVAS.items():
            if not inspector.has_table(tabla):
                continue
            existentes = {col["name"] for col in inspector.get_columns(tabla)}
            for nombre_columna, definicion in columnas.items():
                if nombre_columna in existentes:
                    continue
                try:
                    conexion.execute(
                        text(f"ALTER TABLE {tabla} ADD COLUMN {nombre_columna} {definicion}")
                    )
                    print(f"✅ Migración: se agregó {tabla}.{nombre_columna}")
                except Exception as err:  # pragma: no cover
                    print(f"⚠️  No se pudo agregar {tabla}.{nombre_columna}: {err}")

    _rellenar_slugs()
    _rellenar_proveedor_auth()


def _rellenar_slugs() -> None:
    """Genera el slug de las categorías que ya existían y no tienen uno."""
    try:
        with engine.begin() as conexion:
            filas = conexion.execute(
                text("SELECT id, nombre FROM categorias WHERE slug IS NULL OR slug = ''")
            ).fetchall()

            usados = {
                fila[0]
                for fila in conexion.execute(
                    text("SELECT slug FROM categorias WHERE slug IS NOT NULL AND slug <> ''")
                ).fetchall()
            }

            for categoria_id, nombre in filas:
                base = _slugify(nombre)
                slug = base
                contador = 2
                while slug in usados:
                    slug = f"{base}-{contador}"
                    contador += 1
                usados.add(slug)
                conexion.execute(
                    text("UPDATE categorias SET slug = :slug WHERE id = :id"),
                    {"slug": slug, "id": categoria_id},
                )
    except Exception as err:  # pragma: no cover
        print(f"⚠️  No se pudieron rellenar los slugs de categorías: {err}")


def _rellenar_proveedor_auth():
    """Los usuarios que ya existían (registro local) quedan marcados como 'local'."""
    try:
        with engine.begin() as conexion:
            conexion.execute(
                text(
                    "UPDATE usuarios SET proveedor_auth = 'local' "
                    "WHERE proveedor_auth IS NULL OR proveedor_auth = ''"
                )
            )
    except Exception as err:  # pragma: no cover
        print(f"⚠️  No se pudo normalizar usuarios.proveedor_auth: {err}")
