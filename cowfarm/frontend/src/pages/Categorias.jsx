import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { categoriasApi, generarSlug, resolverUrlImagen } from "../lib/api";
import { usePageStyle } from "../hooks/usePageStyle";

// Portadas de respaldo para las categorías originales del sitio. Las
// categorías nuevas usan la imagen que el administrador les suba; si no
// tienen, se muestra una portada genérica con la inicial del nombre.
const PORTADAS_POR_DEFECTO = {
  ganado: "/images/angus.png",
  insumos: "/images/insumos-organicos-para-agricultura.webp",
  cultivos: "/images/potato-field-4357002_1920.jpg",
};

export default function Categorias() {
  usePageStyle("/styles/styles-categorias.css");
  const { user } = useAuth();
  const rol = (user?.rol || "").toLowerCase();

  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState({ texto: "Cargando categorías...", clase: "estado-carga" });

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const lista = await categoriasApi.listar();
        if (!activo) return;
        setCategorias(lista || []);
        setEstado(
          lista && lista.length
            ? { texto: "", clase: "" }
            : {
                texto:
                  "Todavía no hay categorías creadas. El administrador puede crearlas desde el Panel Admin.",
                clase: "estado-vacio",
              }
        );
      } catch (err) {
        if (!activo) return;
        setEstado({
          texto: "No se pudieron cargar las categorías. ¿Está el backend corriendo?",
          clase: "estado-error",
        });
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return categorias;
    return categorias.filter(
      (c) =>
        (c.nombre || "").toLowerCase().includes(termino) ||
        (c.descripcion || "").toLowerCase().includes(termino)
    );
  }, [categorias, busqueda]);

  return (
    <Layout showFontControls>
      <section className="categorias-hero">
        <h1>Categorías</h1>
        <p>
          Cada categoría es un espacio donde los vendedores publican y los compradores
          compran. Apenas el administrador crea una categoría nueva, aparece aquí lista
          para usarse.
        </p>
        {categorias.length > 3 && (
          <input
            className="categorias-buscador"
            type="search"
            placeholder="Buscar categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar categoría"
          />
        )}
      </section>

      <section className="categorias-section">
        {estado.texto && <p className={estado.clase}>{estado.texto}</p>}

        {!estado.texto && filtradas.length === 0 && (
          <p className="estado-vacio">Ninguna categoría coincide con «{busqueda}».</p>
        )}

        <div className="categorias-grid">
          {filtradas.map((categoria) => {
            const slug = categoria.slug || generarSlug(categoria.nombre);
            const portada =
              resolverUrlImagen(categoria.imagen_url) || PORTADAS_POR_DEFECTO[slug] || null;
            const totalProductos = categoria.total_productos ?? null;

            return (
              <article className="categoria-card" key={categoria.id}>
                <Link to={`/categoria/${slug}`} className="categoria-card-portada">
                  {portada ? (
                    <img src={portada} alt={categoria.nombre} loading="lazy" />
                  ) : (
                    <span className="categoria-card-inicial" aria-hidden="true">
                      {(categoria.nombre || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </Link>

                <div className="categoria-card-body">
                  <h2>
                    <Link to={`/categoria/${slug}`}>{categoria.nombre}</Link>
                  </h2>
                  <p className="categoria-card-desc">
                    {categoria.descripcion ||
                      "Productos del campo colombiano publicados directamente por sus productores."}
                  </p>

                  {totalProductos !== null && (
                    <span className="categoria-card-conteo">
                      {totalProductos === 0
                        ? "Sin productos todavía"
                        : `${totalProductos} producto${totalProductos === 1 ? "" : "s"} publicado${
                            totalProductos === 1 ? "" : "s"
                          }`}
                    </span>
                  )}

                  <div className="categoria-card-acciones">
                    <Link className="btn-categoria btn-categoria--primario" to={`/categoria/${slug}`}>
                      Ver y comprar
                    </Link>
                    {rol === "vendedor" && (
                      <Link className="btn-categoria" to="/publicar">
                        Publicar aquí
                      </Link>
                    )}
                    {(rol === "administrador" || rol === "admin") && (
                      <Link className="btn-categoria" to="/admin">
                        Editar
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {(rol === "administrador" || rol === "admin") && (
          <p className="categorias-nota">
            ¿Necesitas una categoría nueva? Créala en{" "}
            <Link to="/admin">Panel Admin → Categorías</Link> y quedará disponible al
            instante para comprar y publicar.
          </p>
        )}
      </section>
    </Layout>
  );
}
