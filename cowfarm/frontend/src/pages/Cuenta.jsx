import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FontControls from "../components/FontControls";
import { useAuth } from "../context/AuthContext";
import { categoriasApi, direccionesApi, pedidosApi, productosApi, usuariosApi } from "../lib/api";
import { generarFacturaPDF, crearFacturaPDF, generarReporteVentasPDF, crearReporteVentasPDF } from "../lib/pdf";
import { usePageStyle } from "../hooks/usePageStyle";

// Debe reflejar el Enum de estados de pedido del backend.
const ESTADOS_PEDIDO = [
  "PENDIENTE",
  "ACEPTADO",
  "EN_PREPARACION",
  "EN_CAMINO",
  "ENTREGADO",
  "CANCELADO",
];

function formatoMoneda(valor) {
  return `$${Number(valor || 0).toLocaleString("es-CO")}`;
}

function formatoFecha(valor) {
  if (!valor) return "—";
  try {
    return new Date(valor).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return valor;
  }
}

// ============================================================
// Sección: Mi dirección de entrega (se guarda en /direcciones)
// ============================================================
function MiDireccionSection() {
  const { user } = useAuth();
  const [dirId, setDirId] = useState(null);
  const [form, setForm] = useState({ departamento: "", municipio: "", vereda: "", direccion: "" });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ text: "", type: "" });

  useEffect(() => {
    (async () => {
      try {
        const lista = await direccionesApi.listarPorUsuario(user.id);
        if (lista?.length) {
          // El backend usa la de mayor id como dirección de entrega
          const d = lista.reduce((a, b) => (b.id > a.id ? b : a));
          setDirId(d.id);
          setForm({
            departamento: d.departamento || "",
            municipio: d.municipio || "",
            vereda: d.vereda || "",
            direccion: d.direccion || "",
          });
        }
      } catch (err) {
        setMensaje({ text: err.message || "No se pudo cargar tu dirección.", type: "error" });
      }
    })();
  }, [user.id]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ text: "", type: "" });
    setGuardando(true);
    try {
      const payload = {
        departamento: form.departamento.trim(),
        municipio: form.municipio.trim(),
        vereda: form.vereda.trim() || null,
        direccion: form.direccion.trim() || null,
      };
      if (dirId) {
        await direccionesApi.actualizar(dirId, payload);
      } else {
        const nueva = await direccionesApi.crear({ ...payload, usuario_id: user.id });
        setDirId(nueva.id);
      }
      setMensaje({ text: "Dirección guardada correctamente.", type: "success" });
    } catch (err) {
      setMensaje({ text: err.message || "No se pudo guardar la dirección.", type: "error" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ marginTop: 36 }}>
      <h2>Mi dirección de entrega</h2>
      <p className="admin-section-sub">
        Esta es la dirección que verá el distribuidor al entregar tus pedidos.
      </p>
      <form
        className="admin-form-inline"
        style={{ flexDirection: "column", alignItems: "stretch", maxWidth: 480 }}
        onSubmit={handleSubmit}
      >
        <div className="campo">
          <label>Departamento</label>
          <input name="departamento" value={form.departamento} onChange={handleChange} required />
        </div>
        <div className="campo">
          <label>Municipio</label>
          <input name="municipio" value={form.municipio} onChange={handleChange} required />
        </div>
        <div className="campo">
          <label>Vereda (opcional)</label>
          <input name="vereda" value={form.vereda} onChange={handleChange} />
        </div>
        <div className="campo">
          <label>Dirección</label>
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Calle, número, referencias..."
          />
        </div>
        {mensaje.text && <p className={`admin-mensaje ${mensaje.type}`}>{mensaje.text}</p>}
        <button
          type="submit"
          className="btn-admin btn-admin-primario"
          disabled={guardando}
          style={{ alignSelf: "flex-start" }}
        >
          {guardando ? "Guardando..." : dirId ? "Actualizar dirección" : "Guardar dirección"}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// Pestaña: Mis datos (editar perfil propio + contraseña)
// ============================================================
function MisDatosTab() {
  const { user, refrescarUsuario } = useAuth();
  const [form, setForm] = useState({
    nombre: user?.nombre || "",
    apellido: user?.apellido || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
    password: "",
    password2: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ text: "", type: "" });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ text: "", type: "" });

    if (form.password && form.password !== form.password2) {
      setMensaje({ text: "Las contraseñas nuevas no coinciden.", type: "error" });
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono,
      };
      if (form.password) payload.password = form.password;

      await usuariosApi.actualizar(user.id, payload);
      await refrescarUsuario();
      setForm((p) => ({ ...p, password: "", password2: "" }));
      setMensaje({ text: "Datos actualizados correctamente.", type: "success" });
    } catch (err) {
      setMensaje({ text: err.message || "No se pudo actualizar tu perfil.", type: "error" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="admin-section">
      <h2>Mis datos</h2>
      <p className="admin-section-sub">
        Actualiza tu información personal o cambia tu contraseña (RF08 / RF25).
      </p>

      <form
        className="admin-form-inline"
        style={{ flexDirection: "column", alignItems: "stretch", maxWidth: 480 }}
        onSubmit={handleSubmit}
      >
        <div className="campo">
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div className="campo">
          <label>Apellido</label>
          <input name="apellido" value={form.apellido} onChange={handleChange} required />
        </div>
        <div className="campo">
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="campo">
          <label>Teléfono</label>
          <input name="telefono" value={form.telefono} onChange={handleChange} />
        </div>
        <div className="campo">
          <label>Nueva contraseña (opcional)</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Dejar en blanco para no cambiarla"
          />
        </div>
        {form.password && (
          <div className="campo">
            <label>Confirmar nueva contraseña</label>
            <input type="password" name="password2" value={form.password2} onChange={handleChange} />
          </div>
        )}
        {mensaje.text && <p className={`admin-mensaje ${mensaje.type}`}>{mensaje.text}</p>}
        <button
          type="submit"
          className="btn-admin btn-admin-primario"
          disabled={guardando}
          style={{ alignSelf: "flex-start" }}
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <MiDireccionSection />
    </div>
  );
}

// ============================================================
// Pestaña: Mis compras (historial + descarga de recibo PDF)
// ============================================================
function MisComprasTab() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [estado, setEstado] = useState({ texto: "Cargando tus compras...", tipo: "" });
  const [descargando, setDescargando] = useState(null);
  const [visualizando, setVisualizando] = useState(null);
  const [facturaPreview, setFacturaPreview] = useState(null); // { url, pedidoId }

  useEffect(() => {
    return () => {
      if (facturaPreview?.url) URL.revokeObjectURL(facturaPreview.url);
    };
  }, [facturaPreview]);

  useEffect(() => {
    (async () => {
      try {
        const lista = await pedidosApi.listar({ comprador_id: user.id });
        setPedidos(lista || []);
        setEstado(
          lista?.length
            ? { texto: "", tipo: "" }
            : { texto: "Todavía no has realizado compras.", tipo: "vacio" }
        );
      } catch (err) {
        setEstado({ texto: err.message || "No se pudo cargar tu historial de compras.", tipo: "error" });
      }
    })();
  }, [user.id]);

  const descargarRecibo = async (pedidoId) => {
    setDescargando(pedidoId);
    try {
      const pedidoCompleto = await pedidosApi.obtener(pedidoId);
      await generarFacturaPDF(pedidoCompleto, user);
    } catch (err) {
      alert(err.message || "No se pudo generar el PDF del recibo.");
    } finally {
      setDescargando(null);
    }
  };

  const visualizarRecibo = async (pedidoId) => {
    setVisualizando(pedidoId);
    try {
      const pedidoCompleto = await pedidosApi.obtener(pedidoId);
      const doc = await crearFacturaPDF(pedidoCompleto, user);
      const url = doc.output("bloburl");
      if (facturaPreview?.url) URL.revokeObjectURL(facturaPreview.url);
      setFacturaPreview({ url, pedidoId });
    } catch (err) {
      alert(err.message || "No se pudo generar el PDF del recibo.");
    } finally {
      setVisualizando(null);
    }
  };

  const cerrarFacturaPreview = () => {
    if (facturaPreview?.url) URL.revokeObjectURL(facturaPreview.url);
    setFacturaPreview(null);
  };

  return (
    <div className="admin-section">
      <h2>Mis compras</h2>
      <p className="admin-section-sub">Consulta tus pedidos y descarga el recibo en PDF de cualquiera de ellos.</p>

      {estado.texto && <p className={`admin-mensaje ${estado.tipo}`}>{estado.texto}</p>}

      {!estado.texto && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Recibo</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>{formatoFecha(p.fecha_pedido)}</td>
                  <td>{formatoMoneda(p.total)}</td>
                  <td>{p.estado}</td>
                  <td>
                    <div className="admin-acciones">
                      <button
                        className="btn-admin btn-admin-secundario btn-con-icono"
                        onClick={() => visualizarRecibo(p.id)}
                        disabled={visualizando === p.id}
                      >
                        <img src="/images/icono-ver-pdf.png" alt="" className="icono-ver-pdf" />
                        {visualizando === p.id ? "Cargando..." : "Visualizar "}
                      </button>
                      <button
                        className="btn-admin btn-admin-secundario"
                        onClick={() => descargarRecibo(p.id)}
                        disabled={descargando === p.id}
                      >
                        <img src="/images/bandeja-de-entrada.png" alt="" className="icono-ver-pdf" />
                        {descargando === p.id ? "Generando..." : "Descargar PDF"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {facturaPreview && (
        <div className="admin-modal-overlay" onClick={cerrarFacturaPreview}>
          <div className="admin-modal admin-modal--pdf" onClick={(e) => e.stopPropagation()}>
            <h3>Recibo del pedido #{facturaPreview.pedidoId}</h3>
            <iframe
              src={facturaPreview.url}
              title="Previsualización del recibo en PDF"
              className="admin-pdf-frame"
            />
            <div className="admin-modal-acciones">
              <button type="button" className="btn-admin btn-admin-secundario" onClick={cerrarFacturaPreview}>
                Cerrar
              </button>
              <button
                type="button"
                className="btn-admin btn-admin-primario"
                onClick={() => descargarRecibo(facturaPreview.pedidoId)}
              >
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Pestaña: Mis productos (solo vendedor)
// ============================================================
function ModalEditarProductoPropio({ producto, categorias, onClose, onGuardado }) {
  const [form, setForm] = useState({
    nombre: producto.nombre || "",
    descripcion: producto.descripcion || "",
    precio: producto.precio ?? "",
    stock: producto.stock ?? "",
    unidad_medida: producto.unidad_medida || "",
    categoria_id: producto.categoria?.id ?? producto.categoria_id ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      await productosApi.actualizar(producto.id, {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        stock: Number(form.stock),
        unidad_medida: form.unidad_medida,
        categoria_id: Number(form.categoria_id),
      });
      onGuardado();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el producto.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Editar producto</h3>
        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="campo">
            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} />
          </div>
          <div className="campo">
            <label>Categoría</label>
            <select name="categoria_id" value={form.categoria_id} onChange={handleChange} required>
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label>Precio (COP)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              required
            />
          </div>
          <div className="campo">
            <label>Stock disponible</label>
            <input type="number" min="0" name="stock" value={form.stock} onChange={handleChange} required />
          </div>
          <div className="campo">
            <label>Unidad de medida</label>
            <input
              name="unidad_medida"
              value={form.unidad_medida}
              onChange={handleChange}
              placeholder="kg, unidad, litro..."
            />
          </div>
          {error && <p className="admin-mensaje error">{error}</p>}
          <div className="admin-modal-acciones">
            <button type="button" className="btn-admin btn-admin-secundario" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-admin btn-admin-primario" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MisProductosTab() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [estado, setEstado] = useState({ texto: "Cargando tus productos...", tipo: "" });
  const [editando, setEditando] = useState(null);

  const cargar = async () => {
    setEstado({ texto: "Cargando tus productos...", tipo: "" });
    try {
      const [prods, cats] = await Promise.all([
        productosApi.listar({ productor_id: user.id }),
        categoriasApi.listar(),
      ]);
      setProductos(prods || []);
      setCategorias(cats || []);
      setEstado(
        prods?.length
          ? { texto: "", tipo: "" }
          : { texto: "Todavía no has publicado productos.", tipo: "vacio" }
      );
    } catch (err) {
      setEstado({ texto: err.message || "No se pudo cargar tus productos.", tipo: "error" });
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eliminar = async (p) => {
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await productosApi.eliminar(p.id);
      setProductos((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      alert(err.message || "No se pudo eliminar el producto.");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>Mis productos</h2>
          <p className="admin-section-sub">Los productos que has publicado. Edita precio, stock o datos generales.</p>
        </div>
        <a href="/publicar" className="btn-admin btn-admin-primario">
          + Publicar producto
        </a>
      </div>

      {estado.texto && <p className={`admin-mensaje ${estado.tipo}`}>{estado.texto}</p>}

      {!estado.texto && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Publicado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.categoria?.nombre || "—"}</td>
                  <td>{formatoMoneda(p.precio)}</td>
                  <td>{p.stock}</td>
                  <td>{formatoFecha(p.fecha_creacion)}</td>
                  <td>
                    <div className="admin-acciones">
                      <button className="btn-admin btn-admin-secundario" onClick={() => setEditando(p)}>
                        Editar
                      </button>
                      <button className="btn-admin btn-admin-peligro" onClick={() => eliminar(p)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <ModalEditarProductoPropio
          producto={editando}
          categorias={categorias}
          onClose={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// Pestaña: Mis ventas (solo vendedor) — pedidos que incluyen
// alguno de sus productos.
// ============================================================
function MisVentasTab() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [estado, setEstado] = useState({ texto: "Cargando tus ventas...", tipo: "" });
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [visualizandoPdf, setVisualizandoPdf] = useState(false);
  const [reportePreview, setReportePreview] = useState(null); // { url }

  useEffect(() => {
    return () => {
      if (reportePreview?.url) URL.revokeObjectURL(reportePreview.url);
    };
  }, [reportePreview]);

  useEffect(() => {
    (async () => {
      try {
        // El backend permite a un vendedor ver todos los pedidos (para gestionar
        // despachos); aquí nos quedamos solo con los que incluyen algún producto
        // suyo, y solo la parte de la venta que le corresponde.
        const lista = await pedidosApi.listar();
        setPedidos(lista || []);
        setEstado({ texto: "", tipo: "" });
      } catch (err) {
        setEstado({ texto: err.message || "No se pudo cargar tus ventas.", tipo: "error" });
      }
    })();
  }, []);

  const misVentas = useMemo(() => {
    const filas = [];
    pedidos.forEach((p) => {
      if (!p.venta) return; // solo pedidos ya cerrados como venta
      (p.detalles || []).forEach((d) => {
        if (d.producto?.productor_id === user.id) {
          filas.push({
            ventaId: p.venta.id,
            pedidoId: p.id,
            fecha: p.venta.fecha_venta,
            producto: d.producto?.nombre || `Producto #${d.producto_id}`,
            cantidad: d.cantidad,
            subtotal: d.subtotal,
          });
        }
      });
    });
    return filas;
  }, [pedidos, user.id]);

  // Filtra las ventas al periodo elegido (si no se elige nada, es todo el historial).
  const ventasEnPeriodo = useMemo(() => {
    if (!desde && !hasta) return misVentas;
    const desdeTs = desde ? new Date(desde).getTime() : -Infinity;
    // "hasta" incluye el día completo (23:59:59.999)
    const hastaTs = hasta ? new Date(`${hasta}T23:59:59.999`).getTime() : Infinity;
    return misVentas.filter((f) => {
      const t = new Date(f.fecha).getTime();
      return t >= desdeTs && t <= hastaTs;
    });
  }, [misVentas, desde, hasta]);

  const totalVendido = ventasEnPeriodo.reduce((acc, f) => acc + Number(f.subtotal || 0), 0);

  const descargarReporte = async () => {
    setGenerandoPdf(true);
    try {
      await generarReporteVentasPDF(ventasEnPeriodo, user, { desde, hasta });
    } catch (err) {
      alert(err.message || "No se pudo generar el PDF del reporte.");
    } finally {
      setGenerandoPdf(false);
    }
  };

  const visualizarReporte = async () => {
    setVisualizandoPdf(true);
    try {
      const doc = await crearReporteVentasPDF(ventasEnPeriodo, user, { desde, hasta });
      const url = doc.output("bloburl");
      if (reportePreview?.url) URL.revokeObjectURL(reportePreview.url);
      setReportePreview({ url });
    } catch (err) {
      alert(err.message || "No se pudo generar el PDF del reporte.");
    } finally {
      setVisualizandoPdf(false);
    }
  };

  const cerrarReportePreview = () => {
    if (reportePreview?.url) URL.revokeObjectURL(reportePreview.url);
    setReportePreview(null);
  };

  return (
    <div className="admin-section">
      <h2>Mis ventas</h2>
      <p className="admin-section-sub">Ventas cerradas de tus productos (RF10 / RF29 simplificado).</p>

      <div className="admin-form-inline" style={{ alignItems: "flex-end", marginBottom: 20 }}>
        <div className="campo">
          <label>Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div className="campo">
          <label>Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div className="admin-acciones">
          <button
            type="button"
            className="btn-admin btn-admin-secundario btn-con-icono"
            onClick={visualizarReporte}
            disabled={visualizandoPdf}
          >
            <img src="/images/icono-ver-pdf.png" alt="" className="icono-ver-pdf" />
            {visualizandoPdf ? "Cargando..." : "Visualizar"}
          </button>
          <button
            type="button"
            className="btn-admin btn-admin-secundario"
            onClick={descargarReporte}
            disabled={generandoPdf}
          >
            <img src="/images/bandeja-de-entrada.png" alt="" className="icono-ver-pdf" />
            {generandoPdf ? "Generando..." : "Descargar PDF"}
          </button>
        </div>
      </div>

      <div className="admin-kpis" style={{ marginBottom: 30 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total vendido</div>
          <div className="kpi-value">{formatoMoneda(totalVendido)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Unidades vendidas</div>
          <div className="kpi-value">{ventasEnPeriodo.reduce((a, f) => a + Number(f.cantidad || 0), 0)}</div>
        </div>
      </div>

      {estado.texto && <p className={`admin-mensaje ${estado.tipo}`}>{estado.texto}</p>}

      {!estado.texto && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Venta</th>
                <th>Pedido</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Fecha</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {ventasEnPeriodo.map((f, i) => (
                <tr key={`${f.ventaId}-${i}`}>
                  <td>#{f.ventaId}</td>
                  <td>#{f.pedidoId}</td>
                  <td>{f.producto}</td>
                  <td>{f.cantidad}</td>
                  <td>{formatoFecha(f.fecha)}</td>
                  <td>{formatoMoneda(f.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ventasEnPeriodo.length === 0 && (
            <p className="admin-vacio">
              {desde || hasta ? "No hay ventas en el periodo elegido." : "Todavía no tienes ventas cerradas."}
            </p>
          )}
        </div>
      )}

      {reportePreview && (
        <div className="admin-modal-overlay" onClick={cerrarReportePreview}>
          <div className="admin-modal admin-modal--pdf" onClick={(e) => e.stopPropagation()}>
            <h3>Reporte de ventas</h3>
            <iframe
              src={reportePreview.url}
              title="Previsualización del reporte de ventas en PDF"
              className="admin-pdf-frame"
            />
            <div className="admin-modal-acciones">
              <button type="button" className="btn-admin btn-admin-secundario" onClick={cerrarReportePreview}>
                Cerrar
              </button>
              <button type="button" className="btn-admin btn-admin-primario" onClick={descargarReporte}>
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Pestaña: Mis entregas (solo distribuidor) — pedidos que le
// fueron asignados para repartir, con cambio de estado (RF07).
// Requiere el backend actualizado (comprador_nombre, comprador_telefono,
// direccion_entrega, pago_estado, pago_metodo en GET /pedidos/).
// ============================================================

// Etiqueta visual del estado de pago (estilos en línea para no depender del CSS).
const PAGO_INFO = {
  PAGADO: { texto: "Pagado", fondo: "#d9f2e3", color: "#14663a" },
  EFECTIVO: { texto: "Cobrar en efectivo", fondo: "#fff1cc", color: "#8a5a00" },
  PENDIENTE: { texto: "Pago pendiente", fondo: "#ffe3d6", color: "#9a3a10" },
  SIN_PAGO: { texto: "Sin pago", fondo: "#ececec", color: "#555" },
};

function EtiquetaPago({ pedido }) {
  const info = PAGO_INFO[pedido.pago_estado] || PAGO_INFO.SIN_PAGO;
  const metodo =
    pedido.pago_metodo && pedido.pago_estado !== "SIN_PAGO" && pedido.pago_metodo !== "EFECTIVO"
      ? ` · ${pedido.pago_metodo}`
      : "";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: "0.8rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        background: info.fondo,
        color: info.color,
      }}
    >
      {info.texto}
      {metodo}
    </span>
  );
}

function MisEntregasTab() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [estado, setEstado] = useState({ texto: "Cargando tus entregas...", tipo: "" });

  const cargar = async () => {
    setEstado({ texto: "Cargando tus entregas...", tipo: "" });
    try {
      let lista;
      try {
        // Filtro directo en el backend, si lo soporta.
        lista = await pedidosApi.listar({ distribuidor_id: user.id });
      } catch {
        lista = null;
      }
      // Respaldo: si el backend no filtra por distribuidor_id (o el
      // filtro no aplicó), traemos todo y filtramos en el cliente.
      if (!lista || !lista.some((p) => p.distribuidor_id === user.id)) {
        const todos = await pedidosApi.listar();
        lista = (todos || []).filter((p) => p.distribuidor_id === user.id);
      }
      setPedidos(lista || []);
      setEstado(
        lista?.length
          ? { texto: "", tipo: "" }
          : { texto: "No tienes pedidos asignados para entregar por ahora.", tipo: "vacio" }
      );
    } catch (err) {
      setEstado({ texto: err.message || "No se pudo cargar tus entregas.", tipo: "error" });
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiarEstado = async (pedido, nuevoEstado) => {
    if (nuevoEstado === pedido.estado) return;
    try {
      const actualizado = await pedidosApi.actualizarEstado(pedido.id, nuevoEstado);
      // Se actualiza con la respuesta completa para refrescar también el estado de pago.
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedido.id ? { ...p, ...actualizado } : p))
      );
    } catch (err) {
      alert(err.message || "No se pudo actualizar el estado del pedido.");
    }
  };

  return (
    <div className="admin-section" style={{ maxWidth: "none", width: "100%", boxSizing: "border-box" }}>
      <h2>Mis entregas</h2>
      <p className="admin-section-sub">
        Pedidos que te fueron asignados para entregar. Actualiza el estado a medida que avanzas.
      </p>

      {estado.texto && <p className={`admin-mensaje ${estado.tipo}`}>{estado.texto}</p>}

      {!estado.texto && (
        <div className="admin-table-wrap" style={{ overflowX: "visible" }}>
          <style>{`
            .tabla-entregas { width: 100%; table-layout: auto; }
            .tabla-entregas th, .tabla-entregas td { padding: 10px 8px; font-size: 0.85rem; }
            .tabla-entregas .col-nowrap { white-space: nowrap; }
            .tabla-entregas select { min-width: 140px; }
          `}</style>
          <table className="admin-table tabla-entregas">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Comprador</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>{p.comprador_nombre || `ID ${p.comprador_id}`}</td>
                  <td className="col-nowrap">
                    {p.comprador_telefono ? (
                      <a href={`tel:${p.comprador_telefono}`}>{p.comprador_telefono}</a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ minWidth: 180 }}>{p.direccion_entrega || "Sin dirección registrada"}</td>
                  <td className="col-nowrap">{formatoFecha(p.fecha_pedido)}</td>
                  <td className="col-nowrap">{formatoMoneda(p.total)}</td>
                  <td>
                    <EtiquetaPago pedido={p} />
                  </td>
                  <td>
                    <select value={p.estado} onChange={(e) => cambiarEstado(p, e.target.value)}>
                      {ESTADOS_PEDIDO.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Panel principal con pestañas
// ============================================================
function CuentaPanel() {
  const { user } = useAuth();
  const rol = (user?.rol || "").toLowerCase();
  const esVendedor = rol === "vendedor";
  const esDistribuidor = rol === "distribuidor";

  const TABS = [
    { id: "datos", label: "Mis datos" },
    ...(esVendedor ? [{ id: "productos", label: "Mis productos" }] : []),
    ...(esVendedor ? [{ id: "ventas", label: "Mis ventas" }] : []),
    ...(esDistribuidor ? [{ id: "entregas", label: "Mis entregas" }] : []),
  ];

  const [tab, setTab] = useState(esDistribuidor ? "entregas" : "datos");

  return (
    <div
      className="admin-wrapper"
      style={
        tab === "entregas"
          ? { maxWidth: 1400, width: "95%", margin: "0 auto" }
          : undefined
      }
    >
      <div className="admin-header">
        <h1>Mi cuenta</h1>
        <p>Hola, {user?.nombre || "usuario"}. Gestiona tu información y tu actividad en CowFarm.</p>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin-tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "datos" && <MisDatosTab />}
      {tab === "compras" && !esDistribuidor && <MisComprasTab />}
      {tab === "productos" && esVendedor && <MisProductosTab />}
      {tab === "ventas" && esVendedor && <MisVentasTab />}
      {tab === "entregas" && esDistribuidor && <MisEntregasTab />}
    </div>
  );
}

export default function Cuenta() {
  usePageStyle("/styles/styles-admin.css", "admin-body");
  return (
    <>
      <Header />
      <FontControls />
      <ProtectedRoute mensaje="Debes iniciar sesión para ver tu cuenta.">
        <CuentaPanel />
      </ProtectedRoute>
      <Footer />
    </>
  );
}
