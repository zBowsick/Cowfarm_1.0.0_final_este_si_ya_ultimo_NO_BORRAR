import Layout from "../components/Layout";
import ParallaxHero from "../components/ParallaxHero";
import { usePageStyle } from "../hooks/usePageStyle";

export default function Nosotros() {
  usePageStyle("/styles/styles-nosotros.css");
  return (
    <Layout>
      <ParallaxHero title="conócenos más" />

      <section className="sec">
        <h2>Quiénes somos</h2>
        <p>
          CowFarm nació con una idea sencilla: acercar a los campesinos colombianos
          directamente con quienes compran sus productos, sin intermediarios que
          reduzcan sus ganancias. Somos una plataforma digital donde productores de
          ganado, cultivos e insumos agrícolas pueden publicar lo que ofrecen, y donde
          compradores de todo el país encuentran productos frescos y de calidad, con
          procesos de pago y pedido claros y seguros.
        </p>
        <p style={{ marginTop: "20px" }}>
          Creemos en el trabajo del campo colombiano y en la tecnología como
          herramienta para hacerlo más justo, más visible y más rentable para quienes
          lo sostienen día a día.
        </p>
      </section>

      <section className="mv-section">
        <div className="mv-card">
          <span className="mv-icon">🎯</span>
          <h3>Misión</h3>
          <p>
            Conectar de forma directa y transparente a productores agropecuarios
            colombianos con compradores, ofreciendo una plataforma sencilla, segura y
            accesible que impulse el crecimiento del campo.
          </p>
        </div>
        <div className="mv-card">
          <span className="mv-icon">🌱</span>
          <h3>Visión</h3>
          <p>
            Ser la plataforma agrícola de referencia en Colombia, reconocida por
            fortalecer la economía campesina y por facilitar el comercio justo entre
            el campo y la ciudad.
          </p>
        </div>
      </section>

      <section className="valores-section">
        <h2>Nuestros valores</h2>
        <div className="valores-grid">
          <div className="valor-card">
            <span className="valor-icon">🤝</span>
            <h3>Confianza</h3>
            <p>Relaciones claras entre compradores y productores, sin letra pequeña.</p>
          </div>
          <div className="valor-card">
            <span className="valor-icon">🌾</span>
            <h3>Compromiso con el campo</h3>
            <p>Cada funcionalidad se construye pensando en el campesino colombiano.</p>
          </div>
          <div className="valor-card">
            <span className="valor-icon">🔒</span>
            <h3>Seguridad</h3>
            <p>Datos y pagos protegidos en cada transacción dentro de la plataforma.</p>
          </div>
          <div className="valor-card">
            <span className="valor-icon">🚀</span>
            <h3>Innovación</h3>
            <p>Herramientas digitales simples que cualquier productor puede usar.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
