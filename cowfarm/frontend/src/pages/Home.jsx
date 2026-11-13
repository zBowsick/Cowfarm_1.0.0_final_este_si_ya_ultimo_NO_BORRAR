import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import ParallaxHero from "../components/ParallaxHero";
import { usePageStyle } from "../hooks/usePageStyle";

export default function Home() {
  usePageStyle("/styles/styles-home.css");
  return (
    <Layout>
      <ParallaxHero title="cowfarm" />

      <section className="sec">
        <h2 id="autoShow">
          Criamos bienestar,
          <br /> entregamos calidad.
        </h2>
        <div className="container" id="autoShow">
          <div className="card" id="autoShow">
            <figure>
              <img className="angus" src="/images/angus.png" alt="angus_image" />
            </figure>
            <div className="contenido">
              <h3>Ganado</h3>
              <p>
                Ejemplares de ganado criados con bienestar animal, trazabilidad y buen
                manejo sanitario. Contamos con razas seleccionadas para carne y leche,
                listas para fortalecer tu finca o darle un impulso a tu negocio
                ganadero.
              </p>
              <Link to="/ganado">Ver mas</Link>
            </div>
          </div>
        </div>
        <p className="text-1">
          Trabajamos con ganaderos que priorizan el bienestar animal
          <br />
          en cada etapa del proceso. Desde la selección genética hasta el
          <br /> manejo diario en potrero, cada ejemplar cuenta con seguimiento
          <br /> sanitario y trazabilidad completa, para que sepas exactamente <br />
          qué estás llevando a tu finca.
        </p>

        <div className="card-0" id="autoShow">
          <figure>
            <img
              className="angus"
              src="/images/insumos-organicos-para-agricultura.webp"
              alt="angus_image"
            />
          </figure>
          <div className="contenido-0">
            <h3>Insumos</h3>
            <p>
              Fertilizantes, semillas certificadas, concentrados y herramientas de
              trabajo pensados para cada etapa de tu producción. Todo lo que
              necesitas para cuidar tu tierra y tus animales, en un solo lugar.
            </p>
            <Link to="/insumos">Ver mas</Link>
          </div>
        </div>
        <p className="text-0">
          Sabemos que un buen insumo puede marcar la diferencia
          <br />
          entre una cosecha exitosa y una pérdida. Por eso seleccionamos <br />
          proveedores confiables, con productos probados en campo,
          <br />
          para que inviertas tu dinero en algo que realmente funcione.
        </p>

        <div className="card-1" id="autoShow">
          <figure>
            <img
              className="angus"
              src="/images/potato-field-4357002_1920.jpg"
              alt="angus_image"
            />
          </figure>
          <div className="contenido-1">
            <h3>Cultivos</h3>
            <p>
              Cosechas frescas y de temporada, cultivadas directamente por
              agricultores colombianos. Productos del campo con trazabilidad,
              calidad garantizada y precios justos para el productor.
            </p>
            <Link to="/cultivos">Ver mas</Link>
          </div>
        </div>
        <p className="text-1">
          Detrás de cada cosecha hay una familia campesina trabajando
          <br />
          la tierra día a día. Al comprar directo con nosotros,
          <br />
          le pagas un precio justo al productor y llevas a tu mesa <br />
          alimentos frescos, sin pasar por largas cadenas de intermediarios.
        </p>

        <section className="grind">
          <div className="autoBLur" style={{ marginLeft: "130px" }}>
            COMPRA
          </div>
          <div className="autoBLur" style={{ marginLeft: "230px" }}>
            VENTA
          </div>
          <div className="autoBLur" style={{ marginLeft: "130px" }}>
            CONFIANZA
          </div>
          <div className="autoBLur" style={{ marginLeft: "310px" }}>
            TRANSPORTE
          </div>
          <div className="autoBLur" style={{ marginLeft: "0px" }}>
            EFICACIA
          </div>
        </section>
      </section>
    </Layout>
  );
}
