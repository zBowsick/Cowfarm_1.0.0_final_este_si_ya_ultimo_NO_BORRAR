import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import FontControls from "../components/FontControls";
import SocialLogin from "../components/SocialLogin";
import { useAuth } from "../context/AuthContext";
import { usePageStyle } from "../hooks/usePageStyle";

export default function Login() {
  usePageStyle("/styles/styles-index.css");
  const [active, setActive] = useState(false); // true = mostrar panel de registro
  const navigate = useNavigate();
  const { login, registrar, loginConGoogle, loginConFacebook } = useAuth();

  // Login social: es el mismo flujo se abra desde el panel de "Sign In" o
  // el de "Sign Up" (con Google/Facebook no hace falta elegir: si la cuenta
  // no existe, se crea automáticamente).
  const [socialLoading, setSocialLoading] = useState(false);

  // --- estado del formulario de registro ---
  const [signupForm, setSignupForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    rol: "comprador",
    password: "",
  });
  const [signupMessage, setSignupMessage] = useState({ text: "", type: "success" });
  const [signupLoading, setSignupLoading] = useState(false);

  // --- estado del formulario de inicio de sesión ---
  const [signinForm, setSigninForm] = useState({ email: "", password: "" });
  const [signinMessage, setSigninMessage] = useState({ text: "", type: "success" });
  const [signinLoading, setSigninLoading] = useState(false);

  const handleSignupChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace("signup-", "");
    setSignupForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSigninChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace("signin-", "");
    setSigninForm((prev) => ({ ...prev, [key]: value }));
  };

  const irSegunRol = (usuario) => {
    const rol = (usuario?.rol || "").toLowerCase();
    navigate(rol === "administrador" || rol === "admin" ? "/admin" : "/home");
  };

  // Maneja tanto Google como Facebook: ambos terminan devolviendo un
  // usuario ya logueado (la cuenta se crea sola si era la primera vez).
  const manejarExitoSocial = async (promesaLogin) => {
    setSocialLoading(true);
    setSigninMessage({ text: "Conectando...", type: "success" });
    setSignupMessage({ text: "", type: "success" });
    try {
      const usuario = await promesaLogin;
      setSigninMessage({ text: "¡Bienvenido! Redirigiendo...", type: "success" });
      setTimeout(() => irSegunRol(usuario), 500);
    } catch (err) {
      setSigninMessage({ text: err.message, type: "error" });
    } finally {
      setSocialLoading(false);
    }
  };

  const manejarErrorSocial = (mensaje) => {
    setSigninMessage({ text: mensaje, type: "error" });
  };

  const handleGoogleToken = (credential) => manejarExitoSocial(loginConGoogle(credential));
  const handleFacebookToken = (accessToken) => manejarExitoSocial(loginConFacebook(accessToken));

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupMessage({ text: "", type: "success" });
    setSignupLoading(true);
    try {
      await registrar({
        nombre: signupForm.nombre.trim(),
        apellido: signupForm.apellido.trim(),
        email: signupForm.email.trim(),
        telefono: signupForm.telefono.trim() || null,
        rol: signupForm.rol,
        password: signupForm.password,
      });
      setSignupMessage({ text: "¡Cuenta creada! Ahora inicia sesión.", type: "success" });
      setSignupForm({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        rol: "comprador",
        password: "",
      });
      setActive(false);
    } catch (err) {
      setSignupMessage({ text: err.message, type: "error" });
    } finally {
      setSignupLoading(false);
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setSigninMessage({ text: "", type: "success" });
    setSigninLoading(true);
    try {
      const me = await login(signinForm.email.trim(), signinForm.password);
      setSigninMessage({ text: "¡Bienvenido! Redirigiendo...", type: "success" });
      const rol = (me.rol || "").toLowerCase();
      setTimeout(() => {
        navigate(rol === "administrador" || rol === "admin" ? "/admin" : "/home");
      }, 600);
    } catch (err) {
      setSigninMessage({ text: err.message, type: "error" });
    } finally {
      setSigninLoading(false);
    }
  };

  return (
    <>
      <Header />
      <FontControls />

      <div className={`container${active ? " active" : ""}`} id="container">
        <div className="form-container sign-up">
          <form id="form-signup" onSubmit={handleSignup}>
            <h1>Create Account</h1>
            <SocialLogin
              onGoogleToken={handleGoogleToken}
              onFacebookToken={handleFacebookToken}
              onError={manejarErrorSocial}
              disabled={socialLoading}
            />
            <span>or use your email for registeration</span>
            <input
              type="text"
              id="signup-nombre"
              placeholder="Name"
              value={signupForm.nombre}
              onChange={handleSignupChange}
              required
            />
            <input
              type="text"
              id="signup-apellido"
              placeholder="Last name"
              value={signupForm.apellido}
              onChange={handleSignupChange}
              required
            />
            <input
              type="email"
              id="signup-email"
              placeholder="Email"
              value={signupForm.email}
              onChange={handleSignupChange}
              required
            />
            <input
              type="tel"
              id="signup-telefono"
              placeholder="Phone (optional)"
              value={signupForm.telefono}
              onChange={handleSignupChange}
            />
            <select id="signup-rol" value={signupForm.rol} onChange={handleSignupChange} required>
              <option value="comprador">Comprador</option>
              <option value="vendedor">Vendedor</option>
              <option value="administrador">Administrador</option>
              <option value="distribuidor">Distribuidor</option>
            </select>
            <input
              type="password"
              id="signup-password"
              placeholder="Password"
              value={signupForm.password}
              onChange={handleSignupChange}
              required
            />
            <p className={`form-message ${signupMessage.type}`}>{signupMessage.text}</p>
            <button type="submit" disabled={signupLoading}>
              {signupLoading ? "Creando..." : "Sign Up"}
            </button>
          </form>
        </div>

        <div className="form-container sign-in">
          <form id="form-signin" onSubmit={handleSignin}>
            <h1>Sign In</h1>
            <SocialLogin
              onGoogleToken={handleGoogleToken}
              onFacebookToken={handleFacebookToken}
              onError={manejarErrorSocial}
              disabled={socialLoading}
            />
            <span>or use your email password</span>
            <input
              type="email"
              id="signin-email"
              placeholder="Email"
              value={signinForm.email}
              onChange={handleSigninChange}
              required
            />
            <input
              type="password"
              id="signin-password"
              placeholder="Password"
              value={signinForm.password}
              onChange={handleSigninChange}
              required
            />
            <a href="#">Forget Your Password?</a>
            <p className={`form-message ${signinMessage.type}`}>{signinMessage.text}</p>
            <button type="submit" disabled={signinLoading}>
              {signinLoading ? "Entrando..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button className="hidden" id="login" onClick={() => setActive(false)}>
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button className="hidden" id="register" onClick={() => setActive(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
