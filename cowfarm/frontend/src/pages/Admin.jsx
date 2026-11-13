import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import jsPDF from "jspdf";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FontControls from "../components/FontControls";
import ImageUploader from "../components/ImageUploader";
import { useAuth } from "../context/AuthContext";
import {
  categoriasApi,
  metodosPagoApi,
  pagosApi,
  pedidosApi,
  productoImagenesApi,
  productosApi,
  resolverUrlImagen,
  usuariosApi,
} from "../lib/api";
import { usePageStyle } from "../hooks/usePageStyle";


const ROLES = ["comprador", "vendedor", "administrador", "distribuidor"];
const ESTADOS_PEDIDO = [
  "PENDIENTE",
  "ACEPTADO",
  "EN_PREPARACION",
  "EN_CAMINO",
  "ENTREGADO",
  "CANCELADO",
];
const ESTADOS_PAGO = ["PENDIENTE", "PAGADO", "RECHAZADO"];

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
// Pestaña: Resumen (KPIs + gráfica + últimos usuarios)
// ============================================================
function normalizarProductoAdmin(p) {
  return {
    precio: Number(p.precio ?? 0),
    categoriaId: p.categoria_id ?? p.categoria?.id ?? null,
  };
}

function GraficaPrecios({ productos, categorias }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const etiquetas =
      categorias.length > 0
        ? categorias
        : [...new Set(productos.map((p) => p.categoriaId))]
            .filter((id) => id !== null)
            .map((id) => ({ id, nombre: `Categoría ${id}` }));

    const promedios = etiquetas.map((cat) => {
      const delCategoria = productos.filter((p) => p.categoriaId === cat.id);
      if (!delCategoria.length) return 0;
      const suma = delCategoria.reduce((acc, p) => acc + p.precio, 0);
      return Math.round(suma / delCategoria.length);
    });

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: etiquetas.map((c) => c.nombre.charAt(0).toUpperCase() + c.nombre.slice(1)),
        datasets: [
          {
            label: "Precio promedio (COP)",
            data: promedios,
            backgroundColor: ["#359381", "#2fb4cc", "#01221b"],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${Number(value).toLocaleString("es-CO")}`,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [productos, categorias]);

  return <canvas ref={canvasRef} />;
}

function ResumenTab() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [chartEstado, setChartEstado] = useState({ texto: "Cargando gráfica...", clase: "estado-carga" });
  const [usuariosEstado, setUsuariosEstado] = useState({
    texto: "Cargando usuarios...",
    clase: "estado-carga",
  });

  useEffect(() => {
    (async () => {
      try {
        const [prods, cats] = await Promise.all([productosApi.listar(), categoriasApi.listar()]);
        setProductos((prods || []).map(normalizarProductoAdmin));
        setCategorias(cats || []);
        setChartEstado({ texto: "", clase: "" });
      } catch (err) {
        setChartEstado({ texto: "No se pudo cargar la información de productos.", clase: "estado-error" });
      }
    })();

    (async () => {
      try {
        const lista = await usuariosApi.listar();
        setUsuarios(lista || []);
        setUsuariosEstado(
          lista && lista.length
            ? { texto: "", clase: "" }
            : { texto: "Todavía no hay usuarios registrados.", clase: "estado-vacio" }
        );
      } catch (err) {
        setUsuariosEstado({ texto: "No se pudo cargar la lista de usuarios.", clase: "estado-error" });
      }
    })();
  }, []);

  return (
    <>
      <div className="admin-header">
        <h1>Vista general</h1>
        <p>Hola, {user?.nombre || "administrador"}. Este es el estado general de CowFarm.</p>
      </div>

      <div className="admin-kpis">
        <div className="kpi-card">
          <div className="kpi-label">Usuarios registrados</div>
          <div className="kpi-value">{usuarios.length || "—"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Productos publicados</div>
          <div className="kpi-value">{productos.length || "—"}</div>
        </div>
      </div>

      <div className="admin-panels">
        <div className="admin-panel">
          <h2>Precio promedio por categoría</h2>
          {chartEstado.texto && <p className={chartEstado.clase}>{chartEstado.texto}</p>}
          <div className="chart-container">
            {productos.length > 0 && <GraficaPrecios productos={productos} categorias={categorias} />}
          </div>
        </div>

        <div className="admin-panel">
          <h2>Usuarios registrados</h2>
          {usuariosEstado.texto && <p className={usuariosEstado.clase}>{usuariosEstado.texto}</p>}
          <ul className="usuarios-lista">
            {usuarios.map((u) => {
              const nombre = `${u.nombre ?? ""} ${u.apellido ?? ""}`.trim() || u.email || "Usuario";
              return (
                <li key={u.id}>
                  <span className="usuario-nombre">{nombre}</span>
                  <span className="usuario-rol">{u.rol ?? "sin rol"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}


function ModalEditarUsuario({ usuario, onClose, onGuardado }) {
  const [form, setForm] = useState({
    nombre: usuario.nombre || "",
    apellido: usuario.apellido || "",
    email: usuario.email || "",
    telefono: usuario.telefono || "",
    password: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await usuariosApi.actualizar(usuario.id, payload);
      onGuardado();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el usuario.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Editar usuario</h3>
        <form onSubmit={handleSubmit}>
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

function UsuariosTab() {
  const { user: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [estado, setEstado] = useState({ texto: "Cargando usuarios...", tipo: "" });
  const [editando, setEditando] = useState(null);
  const [filtroRol, setFiltroRol] = useState("");

  const cargar = async () => {
    setEstado({ texto: "Cargando usuarios...", tipo: "" });
    try {
      const lista = await usuariosApi.listar();
      setUsuarios(lista || []);
      setEstado({ texto: "", tipo: "" });
    } catch (err) {
      setEstado({ texto: err.message || "No se pudo cargar la lista de usuarios.", tipo: "error" });
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cambiarRol = async (u, nuevoRol) => {
    if (nuevoRol === u.rol) return;
    try {
      await usuariosApi.cambiarRol(u.id, nuevoRol);
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, rol: nuevoRol } : x)));
    } catch (err) {
      alert(err.message || "No se pudo cambiar el rol.");
    }
  };

  const eliminarUsuario = async (u) => {
    if (u.id === usuarioActual?.id) {
      alert("No puedes eliminar tu propio usuario mientras tienes la sesión activa.");
      return;
    }
    if (!confirm(`¿Eliminar a ${u.nombre} ${u.apellido}? Esta acción no se puede deshacer.`)) return;
    try {
      await usuariosApi.eliminar(u.id);
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      alert(err.message || "No se pudo eliminar el usuario.");
    }
  };

  const usuariosFiltrados = filtroRol ? usuarios.filter((u) => u.rol === filtroRol) : usuarios;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>Usuarios</h2>
          <p className="admin-section-sub">
            Edita los datos, cambia el rol o restablece la contraseña de cualquier usuario.
          </p>
        </div>
        <div className="admin-toolbar">
          <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
            <option value="">Todos los roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {estado.texto && <p className={`admin-mensaje ${estado.tipo}`}>{estado.texto}</p>}

      {!estado.texto && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td>{u.telefono || "—"}</td>
                  <td>
                    <select value={u.rol} onChange={(e) => cambiarRol(u, e.target.value)}>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{formatoFecha(u.fecha_registro)}</td>
                  <td>
                    <div className="admin-acciones">
                      <button className="btn-admin btn-admin-secundario" onClick={() => setEditando(u)}>
                        Editar
                      </button>
                      <button className="btn-admin btn-admin-peligro" onClick={() => eliminarUsuario(u)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usuariosFiltrados.length === 0 && <p className="admin-vacio">No hay usuarios con ese rol.</p>}
        </div>
      )}

      {editando && (
        <ModalEditarUsuario
          usuario={editando}
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


function CategoriasTab() {
  const [categorias, setCategorias] = useState([]);
  const [estado, setEstado] = useState({ texto: "Cargando categorías...", tipo: "" });

  // Formulario de creación
  const [nuevo, setNuevo] = useState({ nombre: "", descripcion: "" });
  const [imagenNueva, setImagenNueva] = useState(null);
  const [creando, setCreando] = useState(false);
  const [mensajeCreacion, setMensajeCreacion] = useState({ texto: "", tipo: "" });

  // Edición en línea
  const [editandoId, setEditandoId] = useState(null);
  const [edicion, setEdicion] = useState({ nombre: "", descripcion: "" });
  const [imagenEdicion, setImagenEdicion] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setEstado({ texto: "Cargando categorías...", tipo: "" });
    try {
      const lista = await categoriasApi.listar();
      setCategorias(lista || []);
      setEstado({ texto: "", tipo: "" });
    } catch (err) {
      setEstado({ texto: err.message || "No se pudo cargar las categorías.", tipo: "error" });
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (e) => {
    e.preventDefault();
    if (!nuevo.nombre.trim()) return;
    setCreando(true);
    setMensajeCreacion({ texto: "Creando categoría...", tipo: "" });
    try {
      const creada = await categoriasApi.crear({
        nombre: nuevo.nombre.trim(),
        descripcion: nuevo.descripcion.trim() || null,
      });

      // Si el admin eligió una portada, se sube después de crear la categoría.
      if (imagenNueva) {
        setMensajeCreacion({ texto: "Subiendo la imagen de portada...", tipo: "" });
        await categoriasApi.subirImagen(creada.id, imagenNueva);
      }

      setNuevo({ nombre: "", descripcion: "" });
      setImagenNueva(null);
      setMensajeCreacion({
        texto: `Categoría «${creada.nombre}» creada. Ya se puede publicar y comprar en /categoria/${creada.slug}`,
        tipo: "ok",
      });
      cargar();
    } catch (err) {
      setMensajeCreacion({ texto: err.message || "No se pudo crear la categoría.", tipo: "error" });
    } finally {
      setCreando(false);
    }
  };

  const abrirEdicion = (categoria) => {
    setEditandoId(categoria.id);
    setEdicion({ nombre: categoria.nombre, descripcion: categoria.descripcion || "" });
    setImagenEdicion(null);
  };

  const guardarEdicion = async (id) => {
    if (!edicion.nombre.trim()) return;
    setGuardando(true);
    try {
      await categoriasApi.actualizar(id, {
        nombre: edicion.nombre.trim(),
        descripcion: edicion.descripcion.trim() || null,
      });
      if (imagenEdicion) {
        await categoriasApi.subirImagen(id, imagenEdicion);
      }
      setEditandoId(null);
      setImagenEdicion(null);
      cargar();
    } catch (err) {
      alert(err.message || "No se pudo actualizar la categoría.");
    } finally {
      setGuardando(false);
    }
  };

  const quitarImagen = async (categoria) => {
    if (!confirm(`¿Quitar la imagen de portada de "${categoria.nombre}"?`)) return;
    try {
      await categoriasApi.actualizar(categoria.id, { imagen_url: "" });
      cargar();
    } catch (err) {
      alert(err.message || "No se pudo quitar la imagen.");
    }
  };

  const eliminar = async (categoria) => {
    if (
      !confirm(
        `¿Eliminar la categoría "${categoria.nombre}"? Solo se puede si no tiene productos publicados.`
      )
    )
      return;
    try {
      await categoriasApi.eliminar(categoria.id);
      cargar();
    } catch (err) {
      alert(err.message || "No se pudo eliminar la categoría.");
    }
  };

  return (
    <div className="admin-section">
      <h2>Categorías</h2>
      <p className="admin-section-sub">
        Crea, edita o elimina las categorías del catálogo. Cada categoría que crees queda
        disponible de inmediato para que los vendedores publiquen productos en ella y los
        compradores compren, con su propia página en <code>/categoria/&lt;nombre&gt;</code>.
      </p>

      <form className="admin-form-categoria" onSubmit={crear}>
        <div className="admin-form-categoria-campos">
          <div className="campo">
            <label>Nombre de la categoría</label>
            <input
              value={nuevo.nombre}
              onChange={(e) => setNuevo((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Ej. Fertilizantes"
              required
            />
          </div>
          <div className="campo">
            <label>Descripción (opcional)</label>
            <input
              value={nuevo.descripcion}
              onChange={(e) => setNuevo((p) => ({ ...p, descripcion: e.target.value }))}
              placeholder="Texto corto que verán los compradores"
              maxLength={500}
            />
          </div>
        </div>

        <ImageUploader
          label="Imagen de portada (opcional)"
          ayuda="Se muestra en el listado de categorías y en el encabezado de la categoría."
          value={imagenNueva}
          onChange={setImagenNueva}
          disabled={creando}
        />

        {mensajeCreacion.texto && (
          <p className={`admin-mensaje ${mensajeCreacion.tipo}`}>{mensajeCreacion.texto}</p>
        )}

        <button type="submit" className="btn-admin btn-admin-primario" disabled={creando}>
          {creando ? "Creando..." : "Agregar categoría"}
        </button>
      </form>

      {estado.texto && <p className={`admin-mensaje ${estado.tipo}`}>{estado.texto}</p>}

      {!estado.texto && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Portada</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>URL</th>
                <th>Productos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => {
                const enEdicion = editandoId === c.id;
                const portada = resolverUrlImagen(c.imagen_url);
                return (
                  <tr key={c.id}>
                    <td>
                      {enEdicion ? (
                        <ImageUploader
                          label=""
                          ayuda="Reemplaza la portada actual."
                          value={imagenEdicion}
                          previewUrl={portada}
                          onChange={setImagenEdicion}
                          disabled={guardando}
                        />
                      ) : portada ? (
                        <img className="admin-cat-portada" src={portada} alt={c.nombre} />
                      ) : (
                        <span className="admin-cat-sin-portada">Sin imagen</span>
                      )}
                    </td>
                    <td>
                      {enEdicion ? (
                        <input
                          value={edicion.nombre}
                          onChange={(e) => setEdicion((p) => ({ ...p, nombre: e.target.value }))}
                          autoFocus
                        />
                      ) : (
                        c.nombre
                      )}
                    </td>
                    <td>
                      {enEdicion ? (
                        <input
                          value={edicion.descripcion}
                          onChange={(e) =>
                            setEdicion((p) => ({ ...p, descripcion: e.target.value }))
                          }
                          placeholder="Descripción corta"
                        />
                      ) : (
                        c.descripcion || "—"
                      )}
                    </td>
                    <td>
                      <code className="admin-cat-slug">/categoria/{c.slug}</code>
                    </td>
                    <td>{c.total_productos ?? "—"}</td>
                    <td>
                      <div className="admin-acciones">
                        {enEdicion ? (
                          <>
                            <button
                              className="btn-admin btn-admin-primario"
                              onClick={() => guardarEdicion(c.id)}
                              disabled={guardando}
                            >
                              {guardando ? "Guardando..." : "Guardar"}
                            </button>
                            <button
                              className="btn-admin btn-admin-secundario"
                              onClick={() => setEditandoId(null)}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn-admin btn-admin-secundario"
                              onClick={() => abrirEdicion(c)}
                            >
                              Editar
                            </button>
                            {c.imagen_url && (
                              <button
                                className="btn-admin btn-admin-secundario"
                                onClick={() => quitarImagen(c)}
                              >
                                Quitar imagen
                              </button>
                            )}
                            <button
                              className="btn-admin btn-admin-peligro"
                              onClick={() => eliminar(c)}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {categorias.length === 0 && <p className="admin-vacio">Todavía no hay categorías.</p>}
        </div>
      )}
    </div>
  );
}


function ModalEditarProducto({ producto, categorias, onClose, onGuardado }) {
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

  // Imágenes del producto: las existentes se pueden borrar y se puede
  // agregar una nueva desde el computador o el celular.
  const [imagenes, setImagenes] = useState(producto.imagenes || []);
  const [imagenNueva, setImagenNueva] = useState(null);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const borrarImagen = async (imagen) => {
    if (!confirm("¿Eliminar esta imagen del producto?")) return;
    try {
      await productoImagenesApi.eliminar(imagen.id);
      setImagenes((prev) => prev.filter((i) => i.id !== imagen.id));
    } catch (err) {
      alert(err.message || "No se pudo eliminar la imagen.");
    }
  };

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
      if (imagenNueva) {
        await productoImagenesApi.subir(producto.id, imagenNueva);
      }
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
            <input type="number" min="0" step="0.01" name="precio" value={form.precio} onChange={handleChange} required />
          </div>
          <div className="campo">
            <label>Stock disponible</label>
            <input type="number" min="0" name="stock" value={form.stock} onChange={handleChange} required />
          </div>
          <div className="campo">
            <label>Unidad de medida</label>
            <input name="unidad_medida" value={form.unidad_medida} onChange={handleChange} placeholder="kg, unidad, litro..." />
          </div>

          <div className="campo">
            <label>Imágenes actuales</label>
            {imagenes.length === 0 ? (
              <p className="admin-vacio">Este producto todavía no tiene imágenes.</p>
            ) : (
              <div className="admin-galeria">
                {imagenes.map((img) => (
                  <div className="admin-galeria-item" key={img.id}>
                    <img src={resolverUrlImagen(img.url_imagen)} alt={form.nombre} />
                    <button
                      type="button"
                      className="admin-galeria-borrar"
                      onClick={() => borrarImagen(img)}
                      title="Eliminar imagen"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ImageUploader
            label="Agregar una imagen"
            ayuda="Elige una foto de tu computador o tómala con la cámara del celular."
            value={imagenNueva}
            onChange={setImagenNueva}
            disabled={guardando}
          />

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

function ProductosTab() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [estado, setEstado] = useState({ texto: "Cargando productos...", tipo: "" });
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);

  const cargar = async () => {
    setEstado({ texto: "Cargando productos...", tipo: "" });
    try {
      const [prods, cats] = await Promise.all([productosApi.listar(), categoriasApi.listar()]);
      setProductos(prods || []);
      setCategorias(cats || []);
      setEstado({ texto: "", tipo: "" });
    } catch (err) {
      setEstado({ texto: err.message || "No se pudo cargar los productos.", tipo: "error" });
    }
  };

  useEffect(() => {
    cargar();
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

  const productosFiltrados = productos.filter((p) => {
    if (filtroCategoria && String(p.categoria?.id) !== String(filtroCategoria)) return false;
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>Productos e inventario</h2>
          <p className="admin-section-sub">
            Ajusta precio, stock y datos del producto.
          </p>
        </div>
        <div className="admin-toolbar">
          <input
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {estado.texto && <p className={`admin-mensaje ${estado.tipo}`}>{estado.texto}</p>}

      {!estado.texto && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Vendedor (ID)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.categoria?.nombre || "—"}</td>
                  <td>{formatoMoneda(p.precio)}</td>
                  <td>
                    {p.stock}
                    {Number(p.stock) === 0 && <span className="badge badge-rojo" style={{ marginLeft: 6 }}>Agotado</span>}
                  </td>
                  <td>{p.productor_id}</td>
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
          {productosFiltrados.length === 0 && <p className="admin-vacio">No hay productos que coincidan.</p>}
        </div>
      )}

      {editando && (
        <ModalEditarProducto
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


function PedidosTab() {
  const [pedidos, setPedidos] = useState([]);
  const [distribuidores, setDistribuidores] = useState([]);
  const [estado, setEstado] = useState({ texto: "Cargando pedidos...", tipo: "" });
  const [filtroEstado, setFiltroEstado] = useState("");
  const [expandido, setExpandido] = useState(null);
  const [pagosPorPedido, setPagosPorPedido] = useState({});

  const cargar = async (estadoFiltro) => {
    setEstado({ texto: "Cargando pedidos...", tipo: "" });
    try {
      const [lista, usuarios] = await Promise.all([
        pedidosApi.listar(estadoFiltro ? { estado: estadoFiltro } : {}),
        usuariosApi.listar().catch(() => []),
      ]);
      setPedidos(lista || []);
      setDistribuidores((usuarios || []).filter((u) => u.rol === "distribuidor"));
      setEstado({ texto: "", tipo: "" });
    } catch (err) {
      setEstado({ texto: err.message || "No se pudo cargar los pedidos.", tipo: "error" });
    }
  };

  useEffect(() => {
    cargar(filtroEstado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  const cambiarEstadoPedido = async (pedido, nuevoEstado) => {
    if (nuevoEstado === pedido.estado) return;
    try {
      const actualizado = await pedidosApi.actualizarEstado(pedido.id, nuevoEstado);
      setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? { ...p, estado: actualizado.estado } : p)));
    } catch (err) {
      alert(err.message || "No se pudo actualizar el estado del pedido.");
    }
  };

  const reasignarDistribuidor = async (pedido, nuevoDistribuidorId) => {
    if (!nuevoDistribuidorId || Number(nuevoDistribuidorId) === pedido.distribuidor_id) return;
    try {
      const actualizado = await pedidosApi.asignarDistribuidor(pedido.id, Number(nuevoDistribuidorId));
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedido.id ? { ...p, distribuidor_id: actualizado.distribuidor_id } : p))
      );
    } catch (err) {
      alert(err.message || "No se pudo reasignar el distribuidor.");
    }
  };

  const verPagos = async (pedido) => {
    if (expandido === pedido.id) {
      setExpandido(null);
      return;
    }
    setExpandido(pedido.id);
    if (!pagosPorPedido[pedido.id]) {
      try {
        const pagos = pedido.pagos && pedido.pagos.length ? pedido.pagos : await pagosApi.listarPorPedido(pedido.id);
        setPagosPorPedido((prev) => ({ ...prev, [pedido.id]: pagos || [] }));
      } catch (err) {
        setPagosPorPedido((prev) => ({ ...prev, [pedido.id]: [] }));
      }
    }
  };

  const cambiarEstadoPago = async (pedidoId, pago, nuevoEstado) => {
    if (nuevoEstado === pago.estado) return;
    try {
      const actualizado = await pagosApi.actualizarEstado(pago.id, nuevoEstado);
      setPagosPorPedido((prev) => ({
        ...prev,
        [pedidoId]: prev[pedidoId].map((pg) => (pg.id === pago.id ? actualizado : pg)),
      }));
    } catch (err) {
      alert(err.message || "No se pudo actualizar el estado del pago.");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>Pedidos y pagos</h2>
          <p className="admin-section-sub">
            Cambia el estado de un pedido, reasigna el distribuidor a cargo, revisa sus pagos y
            confírmalos o recházalos.
          </p>
        </div>
        <div className="admin-toolbar">
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS_PEDIDO.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>

      {estado.texto && <p className={`admin-mensaje ${estado.tipo}`}>{estado.texto}</p>}

      {!estado.texto && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Comprador (ID)</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Distribuidor</th>
                <th>Pagos</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <Fragment key={p.id}>
                  <tr>
                    <td>#{p.id}</td>
                    <td>{p.comprador_id}</td>
                    <td>{formatoFecha(p.fecha_pedido)}</td>
                    <td>{formatoMoneda(p.total)}</td>
                    <td>
                      <select value={p.estado} onChange={(e) => cambiarEstadoPedido(p, e.target.value)}>
                        {ESTADOS_PEDIDO.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={p.distribuidor_id ?? ""}
                        onChange={(e) => reasignarDistribuidor(p, e.target.value)}
                        disabled={distribuidores.length === 0}
                      >
                        <option value="" disabled>
                          {distribuidores.length === 0 ? "Sin distribuidores" : "Sin asignar"}
                        </option>
                        {distribuidores.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nombre} {d.apellido}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className="btn-admin btn-admin-secundario" onClick={() => verPagos(p)}>
                        {expandido === p.id ? "Ocultar" : `Ver (${p.pagos?.length ?? 0})`}
                      </button>
                    </td>
                  </tr>
                  {expandido === p.id && (
                    <tr key={`${p.id}-pagos`}>
                      <td colSpan={7} style={{ background: "#fafcfb" }}>
                        {(pagosPorPedido[p.id] || []).length === 0 ? (
                          <p className="admin-vacio">Este pedido no tiene pagos registrados.</p>
                        ) : (
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Pago</th>
                                <th>Método</th>
                                <th>Monto</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(pagosPorPedido[p.id] || []).map((pg) => (
                                <tr key={pg.id}>
                                  <td>#{pg.id}</td>
                                  <td>{pg.metodo_pago}</td>
                                  <td>{formatoMoneda(pg.monto)}</td>
                                  <td>{formatoFecha(pg.fecha_pago)}</td>
                                  <td>
                                    <select
                                      value={pg.estado}
                                      onChange={(e) => cambiarEstadoPago(p.id, pg, e.target.value)}
                                    >
                                      {ESTADOS_PAGO.map((e) => (
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
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {pedidos.length === 0 && <p className="admin-vacio">No hay pedidos con ese estado.</p>}
        </div>
      )}
    </div>
  );
}


// Carga la imagen del logo desde /public y la convierte a base64 (dataURL),
// que es el formato que jsPDF necesita para poder incrustarla en el PDF.
// Se cachea en módulo para no repetir el fetch cada vez que se genera un PDF.
let logoDataUrlCache = null;
async function cargarLogoDataUrl() {
  if (logoDataUrlCache) return logoDataUrlCache;
  try {
    const respuesta = await fetch("/images/logo-1.png");
    const blob = await respuesta.blob();
    logoDataUrlCache = await new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result);
      lector.onerror = reject;
      lector.readAsDataURL(blob);
    });
    return logoDataUrlCache;
  } catch {
    return null; // si falla, el PDF se genera igual, sin logo
  }
}

// Genera el PDF del historial de ventas y devuelve la instancia de jsPDF
// (aún no descargada), para poder previsualizarla o guardarla después.
function generarPDFVentas(ventas, nombreComprador, logoDataUrl) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margenX = 40;
  const anchoUtil = doc.internal.pageSize.getWidth() - margenX * 2;
  const altoPagina = doc.internal.pageSize.getHeight();
  let y = 50;

  // Logo (arriba a la izquierda), manteniendo su proporción real (198x153)
  const logoAncho = 50;
  const logoAlto = (logoAncho * 153) / 198;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margenX, y - 32, logoAncho, logoAlto);
  }
  const textoX = logoDataUrl ? margenX + logoAncho + 12 : margenX;

  // Encabezado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(1, 34, 27);
  doc.text("CowFarm — Historial de ventas", textoX, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 100, 96);
  const fechaGeneracion = new Date().toLocaleString("es-CO");
  doc.text(`Generado el ${fechaGeneracion}`, margenX, y);
  y += 20;

  // Definición de columnas
  const columnas = [
    { titulo: "Venta", key: "venta", ancho: 0.09 },
    { titulo: "Pedido", key: "pedido", ancho: 0.09 },
    { titulo: "Comprador", key: "comprador", ancho: 0.19 },
    { titulo: "Productos", key: "productos", ancho: 0.30 },
    { titulo: "Fecha", key: "fecha", ancho: 0.17 },
    { titulo: "Total", key: "total", ancho: 0.16 },
  ].map((c) => ({ ...c, ancho: c.ancho * anchoUtil }));

  const posX = [];
  let acumulado = margenX;
  columnas.forEach((c) => {
    posX.push(acumulado);
    acumulado += c.ancho;
  });

  const alturaFilaMin = 22;
  const padding = 6;

  const dibujarEncabezadoTabla = () => {
    doc.setFillColor(53, 147, 129); // verde CowFarm
    doc.rect(margenX, y, anchoUtil, alturaFilaMin, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    columnas.forEach((c, i) => {
      doc.text(c.titulo, posX[i] + padding, y + alturaFilaMin / 2 + 3);
    });
    y += alturaFilaMin;
  };

  dibujarEncabezadoTabla();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  let totalGeneral = 0;

  ventas.forEach((p, idx) => {
    const productos =
      (p.detalles || []).map((d) => d.producto?.nombre).filter(Boolean).join(", ") || "—";
    const fila = {
      venta: `#${p.venta.id}`,
      pedido: `#${p.id}`,
      comprador: nombreComprador(p.comprador_id),
      productos,
      fecha: formatoFecha(p.venta.fecha_venta),
      total: formatoMoneda(p.venta.valor_total),
    };
    totalGeneral += Number(p.venta.valor_total || 0);

    // Envolver texto de cada celda según el ancho de su columna
    const lineasPorColumna = columnas.map((c) =>
      doc.splitTextToSize(String(fila[c.key]), c.ancho - padding * 2)
    );
    const maxLineas = Math.max(...lineasPorColumna.map((l) => l.length));
    const alturaFila = Math.max(alturaFilaMin, maxLineas * 11 + 8);

    // Salto de página si no cabe la fila
    if (y + alturaFila > altoPagina - 50) {
      doc.addPage();
      y = 50;
      dibujarEncabezadoTabla();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
    }

    // Fondo alterno para filas
    if (idx % 2 === 0) {
      doc.setFillColor(244, 247, 246);
      doc.rect(margenX, y, anchoUtil, alturaFila, "F");
    }

    doc.setTextColor(1, 34, 27);
    columnas.forEach((c, i) => {
      doc.text(lineasPorColumna[i], posX[i] + padding, y + 13);
    });

    // Línea divisoria
    doc.setDrawColor(219, 228, 225);
    doc.line(margenX, y + alturaFila, margenX + anchoUtil, y + alturaFila);

    y += alturaFila;
  });

  // Total general
  y += 20;
  if (y > altoPagina - 50) {
    doc.addPage();
    y = 50;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(1, 34, 27);
  doc.text(`Total general: ${formatoMoneda(totalGeneral)}`, margenX, y);

  return doc;
}

function VentasTab() {
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [estado, setEstado] = useState({ texto: "Cargando historial de ventas...", tipo: "" });
  const [filtroProducto, setFiltroProducto] = useState("");
  const [filtroComprador, setFiltroComprador] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null); // { doc, url }

  useEffect(() => {
    (async () => {
      try {
        const [listaPedidos, listaUsuarios] = await Promise.all([
          pedidosApi.listar(),
          usuariosApi.listar().catch(() => []),
        ]);
        setPedidos((listaPedidos || []).filter((p) => p.venta));
        setUsuarios(listaUsuarios || []);
        setEstado({ texto: "", tipo: "" });
      } catch (err) {
        setEstado({ texto: err.message || "No se pudo cargar el historial de ventas.", tipo: "error" });
      }
    })();
  }, []);

  const nombreComprador = (id) => {
    const u = usuarios.find((x) => x.id === id);
    return u ? `${u.nombre} ${u.apellido}` : `Usuario #${id}`;
  };

  const ventasFiltradas = pedidos.filter((p) => {
    if (filtroComprador && !nombreComprador(p.comprador_id).toLowerCase().includes(filtroComprador.toLowerCase())) {
      return false;
    }
    if (filtroFecha && !(p.venta?.fecha_venta || "").startsWith(filtroFecha)) return false;
    if (filtroProducto) {
      const contieneProducto = (p.detalles || []).some((d) =>
        (d.producto?.nombre || "").toLowerCase().includes(filtroProducto.toLowerCase())
      );
      if (!contieneProducto) return false;
    }
    return true;
  });

  // Libera la URL del blob anterior al desmontar o al generar una nueva
  useEffect(() => {
    return () => {
      if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url);
    };
  }, [pdfPreview]);

  const handleGenerarPDF = async () => {
    if (ventasFiltradas.length === 0) return;
    setGenerandoPdf(true);
    try {
      const logoDataUrl = await cargarLogoDataUrl();
      const doc = generarPDFVentas(ventasFiltradas, nombreComprador, logoDataUrl);
      const url = doc.output("bloburl");
      setPdfPreview({ doc, url });
    } catch (err) {
      setEstado({ texto: "No se pudo generar el PDF del historial de ventas.", tipo: "error" });
    } finally {
      setGenerandoPdf(false);
    }
  };

  const cerrarPreviewPDF = () => {
    if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url);
    setPdfPreview(null);
  };

  const descargarPDF = () => {
    if (!pdfPreview?.doc) return;
    const fecha = new Date().toISOString().slice(0, 10);
    pdfPreview.doc.save(`historial-ventas-${fecha}.pdf`);
  };

  const productosMasVendidos = useMemo(() => {
    const conteo = {};
    pedidos.forEach((p) => {
      (p.detalles || []).forEach((d) => {
        const nombre = d.producto?.nombre || `Producto #${d.producto_id}`;
        conteo[nombre] = (conteo[nombre] || 0) + Number(d.cantidad || 0);
      });
    });
    return Object.entries(conteo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [pedidos]);

  return (
    <>
      <div className="admin-section">
        <h2>Productos más vendidos</h2>
        <p className="admin-section-sub">Calculado a partir de las ventas cerradas.</p>
        {productosMasVendidos.length === 0 ? (
          <p className="admin-vacio">Todavía no hay ventas registradas.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Unidades vendidas</th>
                </tr>
              </thead>
              <tbody>
                {productosMasVendidos.map(([nombre, cantidad], i) => (
                  <tr key={nombre}>
                    <td>{i + 1}</td>
                    <td>{nombre}</td>
                    <td>{cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>Historial de ventas</h2>
            <p className="admin-section-sub">
              Filtra por producto, comprador o fecha de la venta.
            </p>
          </div>
          <div className="admin-toolbar">
            <input
              placeholder="Producto..."
              value={filtroProducto}
              onChange={(e) => setFiltroProducto(e.target.value)}
            />
            <input
              placeholder="Comprador..."
              value={filtroComprador}
              onChange={(e) => setFiltroComprador(e.target.value)}
            />
            <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
            <button
              type="button"
              className="btn-admin btn-admin-primario btn-con-icono"
              onClick={handleGenerarPDF}
              disabled={generandoPdf || ventasFiltradas.length === 0}
            >
              <img src="/images/icono-ver-pdf.png" alt="" className="icono-ver-pdf" />
              {generandoPdf ? "Generando..." : "Generar PDF"}
            </button>
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
                  <th>Comprador</th>
                  <th>Productos</th>
                  <th>Fecha</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map((p) => (
                  <tr key={p.venta.id}>
                    <td>#{p.venta.id}</td>
                    <td>#{p.id}</td>
                    <td>{nombreComprador(p.comprador_id)}</td>
                    <td>{(p.detalles || []).map((d) => d.producto?.nombre).filter(Boolean).join(", ") || "—"}</td>
                    <td>{formatoFecha(p.venta.fecha_venta)}</td>
                    <td>{formatoMoneda(p.venta.valor_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ventasFiltradas.length === 0 && <p className="admin-vacio">No hay ventas que coincidan con el filtro.</p>}
          </div>
        )}
      </div>

      {pdfPreview && (
        <div className="admin-modal-overlay" onClick={cerrarPreviewPDF}>
          <div className="admin-modal admin-modal--pdf" onClick={(e) => e.stopPropagation()}>
            <h3>Previsualización del historial de ventas</h3>
            <iframe
              src={pdfPreview.url}
              title="Previsualización del PDF de historial de ventas"
              className="admin-pdf-frame"
            />
            <div className="admin-modal-acciones">
              <button type="button" className="btn-admin btn-admin-secundario" onClick={cerrarPreviewPDF}>
                Cerrar
              </button>
              <button type="button" className="btn-admin btn-admin-primario" onClick={descargarPDF}>
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}




function MetodosPagoTab() {
  const [metodos, setMetodos] = useState([]);
  const [estado, setEstado] = useState({ texto: "Cargando métodos de pago...", tipo: "" });
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [descripcionNueva, setDescripcionNueva] = useState("");
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [edicion, setEdicion] = useState({ nombre: "", descripcion: "" });

  const cargar = async () => {
    setEstado({ texto: "Cargando métodos de pago...", tipo: "" });
    try {
      const lista = await metodosPagoApi.listar();
      setMetodos(lista || []);
      setEstado({ texto: "", tipo: "" });
    } catch (err) {
      setEstado({ texto: err.message || "No se pudo cargar los métodos de pago.", tipo: "error" });
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (e) => {
    e.preventDefault();
    if (!nombreNuevo.trim()) return;
    setCreando(true);
    try {
      await metodosPagoApi.crear({ nombre: nombreNuevo.trim(), descripcion: descripcionNueva.trim() || null });
      setNombreNuevo("");
      setDescripcionNueva("");
      cargar();
    } catch (err) {
      alert(err.message || "No se pudo crear el método de pago.");
    } finally {
      setCreando(false);
    }
  };

  const guardarEdicion = async (id) => {
    if (!edicion.nombre.trim()) return;
    try {
      await metodosPagoApi.actualizar(id, {
        nombre: edicion.nombre.trim(),
        descripcion: edicion.descripcion.trim() || null,
      });
      setEditandoId(null);
      cargar();
    } catch (err) {
      alert(err.message || "No se pudo actualizar el método de pago.");
    }
  };

  const alternarActivo = async (m) => {
    try {
      await metodosPagoApi.actualizar(m.id, { activo: !m.activo });
      setMetodos((prev) => prev.map((x) => (x.id === m.id ? { ...x, activo: !m.activo } : x)));
    } catch (err) {
      alert(err.message || "No se pudo cambiar el estado del método de pago.");
    }
  };

  const eliminar = async (m) => {
    if (!confirm(`¿Eliminar el método de pago "${m.nombre}"?`)) return;
    try {
      await metodosPagoApi.eliminar(m.id);
      setMetodos((prev) => prev.filter((x) => x.id !== m.id));
    } catch (err) {
      alert(err.message || "No se pudo eliminar el método de pago.");
    }
  };

  return (
    <div className="admin-section">
      <h2>Métodos de pago</h2>
      <p className="admin-section-sub">
        Registra los métodos de pago disponibles para los compradores (efectivo, transferencia,
        tarjeta, billetera digital...).
      </p>

      <form className="admin-form-inline" onSubmit={crear}>
        <div className="campo">
          <label>Nombre</label>
          <input
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
            placeholder="Ej. Nequi"
            required
          />
        </div>
        <div className="campo">
          <label>Descripción (opcional)</label>
          <select
            value={descripcionNueva}
            onChange={(e) => setDescripcionNueva(e.target.value)}
          >
            <option value="">Selecciona una descripción...</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia bancaria">Transferencia bancaria</option>
            <option value="Billetera digital">Billetera digital</option>
            <option value="Tarjeta de crédito">Tarjeta de crédito</option>
            <option value="Tarjeta débito">Tarjeta débito</option>
            <option value="Código QR">Código QR</option>
            <option value="Pago contraentrega">Pago contraentrega</option>
          </select>
        </div>
        <button type="submit" className="btn-admin btn-admin-primario" disabled={creando}>
          {creando ? "Creando..." : "Agregar método"}
        </button>
      </form>

      {estado.texto && <p className={`admin-mensaje ${estado.tipo}`}>{estado.texto}</p>}

      {!estado.texto && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {metodos.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>
                    {editandoId === m.id ? (
                      <input
                        value={edicion.nombre}
                        onChange={(e) => setEdicion((p) => ({ ...p, nombre: e.target.value }))}
                        autoFocus
                      />
                    ) : (
                      m.nombre
                    )}
                  </td>
                  <td>
                    {editandoId === m.id ? (
                      <select
                        value={edicion.descripcion}
                        onChange={(e) => setEdicion((p) => ({ ...p, descripcion: e.target.value }))}
                      >
                        <option value="">Selecciona una descripción...</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia bancaria">Transferencia bancaria</option>
                        <option value="Billetera digital">Billetera digital</option>
                        <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                        <option value="Tarjeta débito">Tarjeta débito</option>
                        <option value="Código QR">Código QR</option>
                        <option value="Pago contraentrega">Pago contraentrega</option>
                      </select>
                    ) : (
                      m.descripcion || "—"
                    )}
                  </td>
                  <td>
                    <button className="btn-admin btn-admin-secundario" onClick={() => alternarActivo(m)}>
                      {m.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td>
                    <div className="admin-acciones">
                      {editandoId === m.id ? (
                        <>
                          <button className="btn-admin btn-admin-primario" onClick={() => guardarEdicion(m.id)}>
                            Guardar
                          </button>
                          <button className="btn-admin btn-admin-secundario" onClick={() => setEditandoId(null)}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-admin btn-admin-secundario"
                            onClick={() => {
                              setEditandoId(m.id);
                              setEdicion({ nombre: m.nombre, descripcion: m.descripcion || "" });
                            }}
                          >
                            Editar
                          </button>
                          <button className="btn-admin btn-admin-peligro" onClick={() => eliminar(m)}>
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {metodos.length === 0 && <p className="admin-vacio">Todavía no hay métodos de pago registrados.</p>}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Panel principal con pestañas
// ============================================================
const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "usuarios", label: "Usuarios" },
  { id: "categorias", label: "Categorías" },
  { id: "productos", label: "Productos" },
  { id: "pedidos", label: "Pedidos" },
  { id: "ventas", label: "Ventas" },
  { id: "metodos-pago", label: "Métodos de pago" },
];

function AdminPanel() {
  const [tab, setTab] = useState("resumen");

  return (
    <div className="admin-wrapper">
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

      {tab === "resumen" && <ResumenTab />}
      {tab === "usuarios" && <UsuariosTab />}
      {tab === "categorias" && <CategoriasTab />}
      {tab === "productos" && <ProductosTab />}
      {tab === "pedidos" && <PedidosTab />}
      {tab === "ventas" && <VentasTab />}
      {tab === "metodos-pago" && <MetodosPagoTab />}
    </div>
  );
}

export default function Admin() {
  usePageStyle("/styles/styles-admin.css", "admin-body");
  return (
    <>
      <Header />
      <FontControls />
      <ProtectedRoute
        roles={["administrador", "admin"]}
        mensaje="Esta sección es solo para administradores."
      >
        <AdminPanel />
      </ProtectedRoute>
      <Footer />
    </>
  );
}
