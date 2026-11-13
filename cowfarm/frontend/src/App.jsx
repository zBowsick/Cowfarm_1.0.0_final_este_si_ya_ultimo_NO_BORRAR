import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Nosotros from "./pages/Nosotros";
import Servicios from "./pages/Servicios";
import Contacto from "./pages/Contacto";
import Categoria from "./pages/Categoria";
import Categorias from "./pages/Categorias";
import Publicar from "./pages/Publicar";
import Admin from "./pages/Admin";
import Cuenta from "./pages/Cuenta";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
          <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/publicar" element={<Publicar />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/cuenta" element={<Cuenta />} />
          {/* Listado de todas las categorías (incluidas las nuevas) */}
          <Route path="/categorias" element={<Categorias />} />
          {/* Página de una categoría: /categoria/frutas-frescas */}
          <Route path="/categoria/:slug" element={<Categoria />} />
          {/* Compatibilidad con los enlaces antiguos: /ganado, /insumos, /cultivos */}
          <Route path="/:categoria" element={<Categoria />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
