import Layout from "../components/Layout";
import ParallaxHero from "../components/ParallaxHero";
import { usePageStyle } from "../hooks/usePageStyle";

const SERVICIOS = [
  {
    icon: "🐄",
    titulo: "Venta de ganado",
    texto:
      "Publica y encuentra ganado en pie con información clara de raza, peso y estado, directo del productor.",
  },
  {
    icon: "🌾",
    titulo: "Cultivos",
    texto:
      "Compra y venta de cosechas agrícolas frescas, conectando al productor con el comprador sin intermediarios.",
  },
  {
    icon: "🧪",
    titulo: "Insumos agrícolas",
    texto: "Semillas, fertilizantes y demás insumos que tu producción necesita, a un clic de distancia.",
  },
  {
    icon: "💳",
    titulo: "Pagos seguros",
    texto:
      "Métodos de pago confiables (efectivo, Nequi, Daviplata, transferencia o tarjeta) y seguimiento de cada pedido.",
  },
  {
    icon: "🚚",
    titulo: "Gestión de pedidos",
    texto: "Sigue tu pedido desde que se acepta hasta que llega a tu puerta, con estados claros en cada paso.",
  },
  {
    icon: "👤",
    titulo: "Cuentas para todos",
    texto: "Regístrate como comprador o como vendedor y accede a las herramientas pensadas para tu rol.",
  },
];

export default function Servicios() {
  usePageStyle("/styles/styles-servicios.css");
  return (
    <Layout>
      <ParallaxHero title="cowfarm" />

      <section className="servicios-section">
        <h2>Lo que ofrecemos</h2>
        <p className="servicios-intro">
          Todo lo que necesitas para comprar o vender en el campo, desde un solo
          lugar.
        </p>

        <div className="servicios-grid">
          {SERVICIOS.map((s) => (
            <div className="servicio-card" key={s.titulo}>
              <span className="servicio-icon">{s.icon}</span>
              <h3>{s.titulo}</h3>
              <p>{s.texto}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
