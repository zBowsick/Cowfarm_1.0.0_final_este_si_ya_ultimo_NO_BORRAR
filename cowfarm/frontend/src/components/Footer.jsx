import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <img src="/images/negativos.png" alt="CowFarm Logo" className="footer-logo" />
          <p>
            Innovación, sostenibilidad y calidad para el crecimiento del sector
            agropecuario.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h3>Empresa</h3>
            <Link to="/home">Inicio</Link>
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/servicios">Servicios</Link>
            <Link to="/contacto">Contacto</Link>
          </div>

          <div className="footer-column">
            <h3>Soporte</h3>
            <a href="#">Preguntas frecuentes</a>
            <a href="#">Políticas</a>
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
          </div>

          <div className="footer-column">
            <h3>Redes Sociales</h3>
            <a href="https://www.instagram.com/cowfarm_col/">Instagram</a>
            <a href="https://www.facebook.com/profile.php?id=61591304566917&locale=es_LA">Facebook</a>
            <a href="#">TikTok</a>
            <a href="#">YouTube</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 CowFarm. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
