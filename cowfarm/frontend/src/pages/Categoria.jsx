import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  categoriasApi,
  metodosPagoApi,
  pagosApi,
  pedidosApi,
  productosApi,
  resolverUrlImagen,
} from "../lib/api";
import { crearFacturaPDF } from "../lib/pdf";
import { usePageStyle } from "../hooks/usePageStyle";

// Imágenes y textos "bonitos" para las tres categorías originales del sitio.
// Cualquier categoría NUEVA que cree el administrador funciona igual: si no
// aparece aquí, se usa la imagen/descripción que el admin le puso desde el
// Panel Admin y, si tampoco hay, una portada genérica.
const CATEGORIA_META = {
  ganado: {
    descripcion:
      "Ejemplares criados con bienestar animal y trazabilidad, listos para fortalecer tu finca o tu negocio.",
    heroImage: "/images/angus.png",
  },
  insumos: {
    descripcion:
      "Fertilizantes, semillas y herramientas de calidad para potenciar cada etapa de tu producción.",
    heroImage: "/images/insumos-organicos-para-agricultura.webp",
  },
  cultivos: {
    descripcion:
      "Cosechas frescas y de temporada, cultivadas directamente por agricultores colombianos.",
    heroImage: "/images/potato-field-4357002_1920.jpg",
  },
};

const HERO_GENERICO = "/images/fondo1.png";
const IMAGEN_PRODUCTO_POR_DEFECTO = "/images/logo-1.png";

// El catálogo de /metodos-pago/ (RF15, texto libre administrado por el
// admin) es lo que se muestra en el checkout, pero el pago en sí se guarda
// con el Enum fijo del backend (EFECTIVO, NEQUI, DAVIPLATA, TRANSFERENCIA,
// TARJETA). Esta función traduce el nombre del catálogo a ese Enum.
const ENUM_METODOS_PAGO = ["EFECTIVO", "NEQUI", "DAVIPLATA", "TRANSFERENCIA", "TARJETA"];
function mapearMetodoPagoAEnum(nombre) {
  const normalizado = (nombre || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .toUpperCase();
  return ENUM_METODOS_PAGO.find((e) => normalizado.includes(e)) || "EFECTIVO";
}

function capitalizar(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function normalizarProducto(p) {
  return {
    id: p.id,
    nombre: p.nombre ?? "Producto",
    descripcion: p.descripcion ?? "Sin descripción disponible.",
    precio: Number(p.precio ?? 0),
    stock: p.stock ?? null,
    unidad: p.unidad_medida ?? null,
    imagen: resolverUrlImagen(p.imagenes?.[0]?.url_imagen) ?? null,
  };
}

export default function Categoria() {
  usePageStyle("/styles/styles-categoria.css");
  // La ruta puede ser /categoria/:slug (nueva) o /:categoria (la de siempre)
  const params = useParams();
  const slug = params.slug || params.categoria || "";
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // La categoría ya no está quemada en el código: se consulta al backend,
  // así cualquier categoría nueva tiene su propia página automáticamente.
  const [categoria, setCategoria] = useState(null);
  const [cargandoCategoria, setCargandoCategoria] = useState(true);
  const [errorCategoria, setErrorCategoria] = useState("");

  const [productos, setProductos] = useState([]);
  const [estado, setEstado] = useState({ texto: "Cargando productos...", clase: "estado-carga" });

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [metodosPago, setMetodosPago] = useState([]);
  const [metodoPagoId, setMetodoPagoId] = useState("");
  const [modalMensaje, setModalMensaje] = useState({ text: "", type: "success" });
  const [enviando, setEnviando] = useState(false);
  const [facturaPreview, setFacturaPreview] = useState(null); // { doc, url, pedidoId }

  // Libera la URL del blob anterior al desmontar o al generar una nueva
  useEffect(() => {
    return () => {
      if (facturaPreview?.url) URL.revokeObjectURL(facturaPreview.url);
    };
  }, [facturaPreview]);

  useEffect(() => {
    metodosPagoApi
      .listar(true) // solo activos
      .then((lista) => setMetodosPago(lista || []))
      .catch(() => setMetodosPago([]));
  }, []);

  const cargarProductos = useCallback(async (catId) => {
    if (catId === null || catId === undefined) return;
    setEstado({ texto: "Cargando productos...", clase: "estado-carga" });
    try {
      const lista = await productosApi.listar({ categoria_id: catId });
      if (!lista || !lista.length) {
        setEstado({
          texto: "Todavía no hay productos publicados en esta categoría.",
          clase: "estado-vacio",
        });
        setProductos([]);
        return;
      }
      setEstado({ texto: "", clase: "" });
      setProductos(lista.map(normalizarProducto));
    } catch (err) {
      setEstado({
        texto: "No se pudieron cargar los productos. ¿Está el backend corriendo?",
        clase: "estado-error",
      });
      setProductos([]);
    }
  }, []);

  // 1) Buscar la categoría por su slug   2) Cargar sus productos
  useEffect(() => {
    let activo = true;
    (async () => {
      setCargandoCategoria(true);
      setErrorCategoria("");
      try {
        const encontrada = await categoriasApi.obtenerPorSlug(slug);
        if (!activo) return;
        setCategoria(encontrada);
        cargarProductos(encontrada.id);
      } catch (err) {
        if (!activo) return;
        setCategoria(null);
        setErrorCategoria(
          err.message?.includes("no encontrada")
            ? "Esta categoría no existe o fue eliminada."
            : err.message
        );
      } finally {
        if (activo) setCargandoCategoria(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [slug, cargarProductos]);

  const abrirModal = (producto) => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para comprar. Te llevamos al login.");
      navigate("/");
      return;
    }
    setProductoSeleccionado(producto);
    setCantidad(1);
    setDireccion("");
    setNotas("");
    setMetodoPagoId(metodosPago[0]?.id ?? "");
    setModalMensaje({ text: "", type: "success" });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoSeleccionado(null);
  };

  const cerrarFacturaPreview = () => {
    if (facturaPreview?.url) URL.revokeObjectURL(facturaPreview.url);
    setFacturaPreview(null);
  };

  const descargarFacturaPDF = () => {
    if (!facturaPreview?.doc) return;
    facturaPreview.doc.save(`cowfarm-recibo-pedido-${facturaPreview.pedidoId}.pdf`);
  };

  const total = productoSeleccionado ? cantidad * productoSeleccionado.precio : 0;

  const enviarCompra = async (e) => {
    e.preventDefault();
    if (!productoSeleccionado || !user || !categoria) return;

    if (!metodoPagoId) {
      setModalMensaje({ text: "Selecciona un método de pago.", type: "error" });
      return;
    }

    setEnviando(true);
    setModalMensaje({ text: "Procesando compra...", type: "success" });

    try {
      const creado = await pedidosApi.crear({
        comprador_id: user.id,
        items: [
          {
            producto_id: Number(productoSeleccionado.id),
            categoria_id: Number(categoria.id),
            cantidad: Number(cantidad),
          },
        ],
      });

      // Registramos el pago del pedido recién creado con el método elegido.
      try {
        const metodo = metodosPago.find((m) => m.id === Number(metodoPagoId));
        await pagosApi.crear({
          pedido_id: creado.pedido_id,
          metodo_pago: mapearMetodoPagoAEnum(metodo?.nombre),
          monto: creado.total,
        });
      } catch (pagoErr) {
        console.warn("No se pudo registrar el pago:", pagoErr.message);
      }

      setModalMensaje({
        text: "¡Compra realizada con éxito! Generando tu recibo en PDF...",
        type: "success",
      });
      cargarProductos(categoria.id); // refresca stock

      // Traemos el pedido completo (con productos y precios) para armar el PDF
      // y lo mostramos en una previsualización con opción de descarga.
      try {
        const pedidoCompleto = await pedidosApi.obtener(creado.pedido_id);
        const doc = await crearFacturaPDF(pedidoCompleto, user);
        const url = doc.output("bloburl");
        setFacturaPreview({ doc, url, pedidoId: creado.pedido_id });
        setModalMensaje({
          text: "¡Compra realizada con éxito! Ya puedes descargar tu recibo en PDF.",
          type: "success",
        });
      } catch (pdfErr) {
        // La compra sí se realizó; si el PDF falla no bloqueamos el flujo.
        console.warn("No se pudo generar el PDF del recibo:", pdfErr.message);
        setModalMensaje({
          text: "¡Compra realizada con éxito! (no se pudo generar el PDF del recibo)",
          type: "success",
        });
      }

      setTimeout(cerrarModal, 1800);
    } catch (err) {
      setModalMensaje({ text: err.message, type: "error" });
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoCategoria) {
    return (
      <Layout showFontControls>
        <section className="productos-section">
          <p className="estado-carga">Cargando categoría...</p>
        </section>
      </Layout>
    );
  }

  if (!categoria) {
    return (
      <Layout showFontControls>
        <div className="acceso-denegado">
          <h1>Categoría no encontrada</h1>
          <p>{errorCategoria}</p>
          <Link className="btn-comprar" to="/categorias">
            Ver todas las categorías
          </Link>
        </div>
      </Layout>
    );
  }

  const metaLocal = CATEGORIA_META[(categoria.slug || "").toLowerCase()] || {};
  const heroImage =
    resolverUrlImagen(categoria.imagen_url) || metaLocal.heroImage || HERO_GENERICO;
  const descripcion =
    categoria.descripcion ||
    metaLocal.descripcion ||
    `Explora los productos publicados en ${categoria.nombre} por productores colombianos.`;

  const rol = (user?.rol || "").toLowerCase();

  return (
    <Layout showFontControls>
      <section className="categoria-hero" style={{ backgroundImage: `url('${heroImage}')` }}>
        <div className="categoria-hero-content">
          <h1>{capitalizar(categoria.nombre)}</h1>
          <p>{descripcion}</p>
          <div className="categoria-hero-acciones">
            <Link className="categoria-hero-link" to="/categorias">
              ← Todas las categorías
            </Link>
            {rol === "vendedor" && (
              <Link className="categoria-hero-link" to="/publicar">
                Publicar aquí
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="productos-section">
        {estado.texto && <p className={estado.clase}>{estado.texto}</p>}
        <div className="productos-grid">
          {productos.map((producto) => {
            const imagen = producto.imagen || IMAGEN_PRODUCTO_POR_DEFECTO;
            const precioTexto = producto.precio
              ? `$${producto.precio.toLocaleString("es-CO")}`
              : "Precio a consultar";
            const stockTexto =
              producto.stock !== null && producto.stock !== undefined
                ? `${producto.stock} disponibles`
                : "";
            return (
              <div className="producto-card" key={producto.id}>
                <img
                  className="producto-imagen"
                  src={imagen}
                  alt={producto.nombre}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = IMAGEN_PRODUCTO_POR_DEFECTO;
                  }}
                />
                <div className="producto-body">
                  <h3>{producto.nombre}</h3>
                  <p className="producto-descripcion">{producto.descripcion}</p>
                  <div className="producto-footer">
                    <div>
                      <span className="producto-precio">
                        {precioTexto}
                        {producto.unidad ? ` / ${producto.unidad}` : ""}
                      </span>
                      {stockTexto && <span className="producto-stock">{stockTexto}</span>}
                    </div>
                    <button
                      className="btn-comprar"
                      onClick={() => abrirModal(producto)}
                      disabled={producto.stock === 0}
                    >
                      {producto.stock === 0 ? "Agotado" : "Comprar"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL DE COMPRA */}
      <div
        className={`modal-overlay${modalAbierto ? " activo" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) cerrarModal();
        }}
      >
        <div className="modal-box">
          <button className="modal-cerrar" type="button" onClick={cerrarModal}>
            &times;
          </button>
          <h2>{productoSeleccionado?.nombre || "Producto"}</h2>
          <p className="modal-producto-precio">
            {productoSeleccionado?.precio
              ? `$${productoSeleccionado.precio.toLocaleString("es-CO")} / unidad`
              : "Precio a consultar"}
          </p>

          <form onSubmit={enviarCompra}>
            <label htmlFor="compra-cantidad">Cantidad</label>
            <input
              type="number"
              id="compra-cantidad"
              min="1"
              max={productoSeleccionado?.stock || undefined}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value) || 1)}
              required
            />

            <label htmlFor="compra-direccion">Dirección de entrega</label>
            <input
              type="text"
              id="compra-direccion"
              placeholder="Finca, vereda, municipio..."
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
            />

            <label htmlFor="compra-notas">Notas (opcional)</label>
            <textarea
              id="compra-notas"
              placeholder="Indicaciones adicionales para la entrega"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />

            <label htmlFor="compra-metodo-pago">Método de pago</label>
            <select
              id="compra-metodo-pago"
              value={metodoPagoId}
              onChange={(e) => setMetodoPagoId(e.target.value)}
              required
              disabled={metodosPago.length === 0}
            >
              <option value="" disabled>
                {metodosPago.length === 0
                  ? "No hay métodos de pago disponibles"
                  : "Selecciona un método"}
              </option>
              {metodosPago.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>

            <p className="modal-total">Total: ${total.toLocaleString("es-CO")}</p>
            <p className={`modal-message ${modalMensaje.type}`}>{modalMensaje.text}</p>

            <button type="submit" className="btn-confirmar-compra" disabled={enviando}>
              Confirmar compra
            </button>
          </form>
        </div>
      </div>

      {/* MODAL DE PREVISUALIZACIÓN DEL RECIBO PDF */}
      {facturaPreview && (
        <div className="modal-overlay activo" onClick={cerrarFacturaPreview}>
          <div className="modal-box modal-box--pdf" onClick={(e) => e.stopPropagation()}>
            <button className="modal-cerrar" type="button" onClick={cerrarFacturaPreview}>
              &times;
            </button>
            <h2>Tu recibo de compra</h2>
            <iframe
              src={facturaPreview.url}
              title="Previsualización del recibo en PDF"
              className="pdf-frame"
            />
            <div className="pdf-preview-acciones">
              <button type="button" className="btn-pdf-secundario" onClick={cerrarFacturaPreview}>
                Cerrar
              </button>
              <button type="button" className="btn-confirmar-compra" onClick={descargarFacturaPDF}>
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
