import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = (e) => {
    if (isAuthenticated) {
      e.preventDefault();
      logout();
      navigate("/");
    }
    // si no hay sesión, el link normal lleva a "/" (login)
  };

  const rol = (user?.rol || "").toLowerCase();

  return (
    <header>
      <img src="/images/logo-1.png" alt="logo" className="logo logo-light" />
      <img src="/images/negativos.png" alt="logo" className="logo logo-dark" />
      <nav className="navigation">
        <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
          Home
        </NavLink>
        <NavLink to="/nosotros" className={({ isActive }) => (isActive ? "active" : "")}>
          Nosotros
        </NavLink>
        <NavLink to="/servicios" className={({ isActive }) => (isActive ? "active" : "")}>
          Servicios
        </NavLink>
        <NavLink
          to="/categorias"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Categorías
        </NavLink>
        <NavLink to="/contacto" className={({ isActive }) => (isActive ? "active" : "")}>
          Contacto
        </NavLink>
        {rol === "vendedor" && (
          <NavLink to="/publicar" className={({ isActive }) => (isActive ? "active" : "")}>
            Publicar producto
          </NavLink>
        )}
        {(rol === "administrador" || rol === "admin") && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            Panel Admin
          </NavLink>
        )}
        {isAuthenticated && (
          <NavLink to="/cuenta" className={({ isActive }) => (isActive ? "active" : "")}>
            Mi cuenta
          </NavLink>
        )}
        {isAuthenticated && user?.nombre && (
          <span className="nav-saludo">Hola, {user.nombre}</span>
        )}
        <NavLink to="/" onClick={handleAuthClick}>
          <button className="btnlogin-popup">
            {isAuthenticated ? "Cerrar sesión" : "Login"}
          </button>
        </NavLink>
      </nav>
    </header>
  );
}
