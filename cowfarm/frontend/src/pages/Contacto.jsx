import { useState } from "react";
import Layout from "../components/Layout";
import ParallaxHero from "../components/ParallaxHero";
import { usePageStyle } from "../hooks/usePageStyle";
import { contactoApi } from "../lib/api";

export default function Contacto() {
  usePageStyle("/styles/styles-contacto.css");
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [message, setMessage] = useState({ text: "", type: "success" });
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nombre, email, mensaje } = form;

    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      setMessage({ text: "Por favor completa todos los campos.", type: "error" });
      return;
    }

    setEnviando(true);
    setMessage({ text: "", type: "" });
    try {
      await contactoApi.enviar({ nombre: nombre.trim(), email: email.trim(), mensaje: mensaje.trim() });
      setMessage({
        text: `¡Gracias, ${nombre}! Recibimos tu mensaje y te contactaremos pronto a ${email}.`,
        type: "success",
      });
      setForm({ nombre: "", email: "", mensaje: "" });
    } catch (err) {
      setMessage({
        text: err.message || "No se pudo enviar tu mensaje. Intenta de nuevo en unos minutos.",
        type: "error",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Layout>
      <ParallaxHero title="contactos" />

      <section className="contacto-section">
        <div className="contacto-info">
          <h2>Hablemos</h2>
          <p>
            ¿Tienes dudas sobre CowFarm, quieres vender tus productos o simplemente
            contarnos algo? Escríbenos y te respondemos pronto.
          </p>

          <div className="info-item">
            <span className="info-icon">📍</span>
            <span>Colombia</span>
          </div>
          <div className="info-item">
            <span className="info-icon">✉️</span>
            <span>contacto@cowfarm.com</span>
          </div>
          <div className="info-item">
            <span className="info-icon">📞</span>
            <span>+57 300 000 0000</span>
          </div>
        </div>

        <form className="contacto-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Tu correo"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Tu mensaje"
            rows={5}
            value={form.mensaje}
            onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
            required
          />
          <p className={`form-message ${message.type}`}>{message.text}</p>
          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>
      </section>
    </Layout>
  );
}
