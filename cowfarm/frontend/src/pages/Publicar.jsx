import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FontControls from "../components/FontControls";
import ImageUploader from "../components/ImageUploader";
import { useAuth } from "../context/AuthContext";
import {
  categoriasApi,
  productoImagenesApi,
  productosApi,
  resolverUrlImagen,
} from "../lib/api";
import { usePageStyle } from "../hooks/usePageStyle";

const FORM_VACIO = {
  categoriaId: "",
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  unidadMedida: "",
  imagenUrl: "",
};

function PublicarForm() {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [form, setForm] = useState(FORM_VACIO);

  // Archivo elegido desde el computador o el celular (aún no subido).
  const [archivoImagen, setArchivoImagen] = useState(null);
  // "archivo" | "url": cómo quiere el vendedor poner la foto.
  const [modoImagen, setModoImagen] = useState("archivo");

  const [message, setMessage] = useState({ text: "", type: "success" });
  const [publicando, setPublicando] = useState(false);
  const [publicados, setPublicados] = useState([]);

  const cargarCategorias = async () => {
    setCargandoCategorias(true);
    try {
      const lista = await categoriasApi.listar();
      setCategorias(lista || []);
    } catch (err) {
      setCategorias([]);
    } finally {
      setCargandoCategorias(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "success" });

    if (!form.categoriaId) {
      setMessage({ text: "Selecciona una categoría.", type: "error" });
      return;
    }

    setPublicando(true);
    setMessage({ text: "Publicando producto...", type: "success" });

    try {
      const producto = await productosApi.crear({
        categoria_id: Number(form.categoriaId),
        productor_id: user.id,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
        stock: Number(form.stock),
        unidad_medida: form.unidadMedida.trim() || null,
      });

      // Las imágenes viven en una tabla aparte (producto_imagenes), así que
      // se registran en un segundo paso, cuando el producto ya tiene id.
      let imagenGuardada = null;
      let avisoImagen = "";

      try {
        if (modoImagen === "archivo" && archivoImagen) {
          setMessage({ text: "Subiendo la imagen...", type: "success" });
          imagenGuardada = await productoImagenesApi.subir(producto.id, archivoImagen);
        } else if (modoImagen === "url" && form.imagenUrl.trim()) {
          imagenGuardada = await productoImagenesApi.crear({
            producto_id: producto.id,
            url_imagen: form.imagenUrl.trim(),
          });
        }
      } catch (imgErr) {
        // El producto sí se creó; solo avisamos que la imagen falló.
        avisoImagen = ` (la imagen no se pudo guardar: ${imgErr.message})`;
      }

      const categoriaSeleccionada = categorias.find(
        (c) => c.id === Number(form.categoriaId)
      );

      setMessage({
        text: `¡Producto publicado con éxito!${avisoImagen}`,
        type: avisoImagen ? "error" : "success",
      });

      setPublicados((prev) => [
        {
          ...producto,
          categoriaNombre: categoriaSeleccionada?.nombre || "",
          categoriaSlug: categoriaSeleccionada?.slug || "",
          imagen: imagenGuardada?.url_imagen || null,
        },
        ...prev,
      ]);

      setForm(FORM_VACIO);
      setArchivoImagen(null);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setPublicando(false);
    }
  };

  return (
    <div className="publicar-wrapper">
      <div className="publicar-header">
        <h1>Publicar producto</h1>
        <p>
          Hola, {user?.nombre || "vendedor"}. Completa los datos para publicar un nuevo producto.
        </p>
      </div>

      <div className="publicar-grid">
        <form className="publicar-form" onSubmit={handleSubmit}>
          <label htmlFor="producto-categoria">Categoría</label>
          <select
            id="producto-categoria"
            name="categoriaId"
            value={form.categoriaId}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              {cargandoCategorias ? "Cargando categorías..." : "Selecciona una categoría"}
            </option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre.charAt(0).toUpperCase() + c.nombre.slice(1)}
              </option>
            ))}
          </select>

          {!cargandoCategorias && categorias.length === 0 && (
            <p className="publicar-aviso">
              Todavía no hay categorías creadas. Pídele al administrador que cree una
              desde el Panel Admin → Categorías.
            </p>
          )}

          {!cargandoCategorias && categorias.length > 0 && (
            <p className="publicar-aviso">
              ¿No ves tu categoría? Cada categoría nueva que cree el administrador aparece
              aquí automáticamente. <Link to="/categorias">Ver todas las categorías</Link>
            </p>
          )}

          <label htmlFor="producto-nombre">Nombre del producto</label>
          <input
            type="text"
            id="producto-nombre"
            name="nombre"
            placeholder="Ej: Novillo Angus 18 meses"
            value={form.nombre}
            onChange={handleChange}
            required
          />

          <label htmlFor="producto-descripcion">Descripción</label>
          <textarea
            id="producto-descripcion"
            name="descripcion"
            placeholder="Describe el producto: características, procedencia, condiciones de entrega..."
            value={form.descripcion}
            onChange={handleChange}
            required
          />

          <div className="publicar-form-row">
            <div>
              <label htmlFor="producto-precio">Precio (COP)</label>
              <input
                type="number"
                id="producto-precio"
                name="precio"
                min="0"
                step="1"
                placeholder="Ej: 150000"
                value={form.precio}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="producto-stock">Stock disponible</label>
              <input
                type="number"
                id="producto-stock"
                name="stock"
                min="0"
                step="1"
                placeholder="Ej: 10"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label htmlFor="producto-unidad">Unidad de medida (opcional)</label>
          <input
            type="text"
            id="producto-unidad"
            name="unidadMedida"
            placeholder="Ej: kg, bulto, unidad, litro"
            value={form.unidadMedida}
            onChange={handleChange}
          />

          {/* --- Imagen del producto --- */}
          <div className="publicar-imagen-bloque">
            <div className="publicar-tabs-imagen">
              <button
                type="button"
                className={modoImagen === "archivo" ? "activo" : ""}
                onClick={() => setModoImagen("archivo")}
              >
                Subir desde mi dispositivo
              </button>
              <button
                type="button"
                className={modoImagen === "url" ? "activo" : ""}
                onClick={() => setModoImagen("url")}
              >
                Usar una URL
              </button>
            </div>

            {modoImagen === "archivo" ? (
              <ImageUploader
                label="Foto del producto (opcional)"
                ayuda="Elige una foto de tu computador, o tómala con la cámara de tu celular."
                value={archivoImagen}
                onChange={setArchivoImagen}
                disabled={publicando}
              />
            ) : (
              <>
                <label htmlFor="producto-imagen">URL de imagen (opcional)</label>
                <input
                  type="url"
                  id="producto-imagen"
                  name="imagenUrl"
                  placeholder="https://..."
                  value={form.imagenUrl}
                  onChange={handleChange}
                />
              </>
            )}
          </div>

          <p className={`form-message ${message.type}`}>{message.text}</p>

          <button type="submit" className="btn-publicar" disabled={publicando}>
            {publicando ? "Publicando..." : "Publicar producto"}
          </button>
        </form>

        <div className="publicar-lista-panel">
          <h2>Publicados en esta sesión</h2>
          {publicados.length === 0 ? (
            <p className="estado-vacio">Todavía no has publicado productos en esta sesión.</p>
          ) : (
            <ul className="publicados-lista">
              {publicados.map((p) => (
                <li key={p.id}>
                  {p.imagen && (
                    <img
                      className="item-miniatura"
                      src={resolverUrlImagen(p.imagen)}
                      alt={p.nombre}
                    />
                  )}
                  <div className="item-datos">
                    <div className="item-top">
                      <span className="item-nombre">{p.nombre}</span>
                      <span className="item-precio">
                        ${Number(p.precio).toLocaleString("es-CO")}
                      </span>
                    </div>
                    <div className="item-meta">
                      {p.categoriaSlug ? (
                        <Link className="item-categoria" to={`/categoria/${p.categoriaSlug}`}>
                          {p.categoriaNombre}
                        </Link>
                      ) : (
                        <span className="item-categoria">{p.categoriaNombre}</span>
                      )}
                      <span className="item-stock">{p.stock} en stock</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Publicar() {
  usePageStyle("/styles/styles-publicar.css", "publicar-body");
  return (
    <>
      <Header />
      <FontControls />
      <ProtectedRoute
        roles={["vendedor"]}
        mensaje="Esta sección es solo para cuentas de tipo vendedor."
      >
        <PublicarForm />
      </ProtectedRoute>
      <Footer />
    </>
  );
}
