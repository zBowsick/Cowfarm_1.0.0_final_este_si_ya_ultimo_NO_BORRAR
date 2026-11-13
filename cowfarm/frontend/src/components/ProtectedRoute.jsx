import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Footer from "./Footer";

export default function ProtectedRoute({ roles, mensaje, children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <>
        <Header />
        <div className="acceso-cargando">Cargando...</div>
        <Footer />
      </>
    );
  }

  const rolActual = (user?.rol || "").toLowerCase();
  const rolesPermitidos = roles?.map((r) => r.toLowerCase());
  const tieneAcceso =
    isAuthenticated && (!rolesPermitidos || rolesPermitidos.includes(rolActual));

  if (!tieneAcceso) {
    return (
      <>
        <Header />
        <div className="acceso-denegado">
          <h1>Acceso restringido</h1>
          <p>{mensaje || "Debes iniciar sesión para ver esta página."}</p>
          <p>
            <a href="/">Ir a iniciar sesión</a>
          </p>
        </div>
        <Footer />
      </>
    );
  }

  return children;
}
