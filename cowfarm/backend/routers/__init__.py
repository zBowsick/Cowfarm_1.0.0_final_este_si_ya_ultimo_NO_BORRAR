from fastapi import FastAPI

from routers.auth import router as auth_router
from routers.categoria import router as categoria_router
from routers.usuario import router as usuario_router
from routers.direccion import router as direccion_router
from routers.producto import router as producto_router
from routers.productoImagen import router as producto_imagen_router
from routers.pedido import router as pedido_router
from routers.detalle_pedido import router as detalle_pedido_router
from routers.pago import router as pago_router
from routers.venta import router as venta_router
from routers.proveedor import router as proveedor_router
from routers.metodo_pago import router as metodo_pago_router
from routers.contacto import router as contacto_router


def register_routers(app: FastAPI) -> None:
    app.include_router(auth_router)
    app.include_router(categoria_router)
    app.include_router(usuario_router)
    app.include_router(direccion_router)
    app.include_router(producto_router)
    app.include_router(producto_imagen_router)
    app.include_router(pedido_router)
    app.include_router(detalle_pedido_router)
    app.include_router(pago_router)
    app.include_router(venta_router)
    app.include_router(proveedor_router)
    app.include_router(metodo_pago_router)
    app.include_router(contacto_router)