import { useEffect, useRef, useState } from "react";
import { useExternalScript } from "../hooks/useExternalScript";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || "";

const GOOGLE_SDK_SRC = "https://accounts.google.com/gsi/client";
const FACEBOOK_SDK_SRC = "https://connect.facebook.net/es_LA/sdk.js";

/**
 * SocialLogin — botones reales de "Continuar con Google" y "Continuar con
 * Facebook" dentro del mismo círculo que ya tenía el diseño original.
 *
 * Cómo funciona (resumen para quien lea el código más adelante):
 *   1. Se cargan los SDKs oficiales de Google y Facebook en el navegador.
 *   2. El usuario hace clic y el propio SDK abre la ventana de Google/Facebook.
 *   3. El SDK nos devuelve un token (nunca un email "de confianza").
 *   4. Ese token se manda tal cual al backend, que lo verifica contra los
 *      servidores de Google/Facebook antes de dar por buena la identidad.
 *
 * Requiere configurar VITE_GOOGLE_CLIENT_ID y VITE_FACEBOOK_APP_ID en el
 * .env del frontend (y sus equivalentes en el backend). Sin esas variables
 * los botones se muestran deshabilitados con una pista de qué falta.
 */
export default function SocialLogin({ onGoogleToken, onFacebookToken, onError, disabled }) {
  const googleEstado = useExternalScript(GOOGLE_CLIENT_ID ? GOOGLE_SDK_SRC : null);
  const facebookEstado = useExternalScript(FACEBOOK_APP_ID ? FACEBOOK_SDK_SRC : null);

  const googleBotonRef = useRef(null);
  const [facebookListo, setFacebookListo] = useState(false);
  const [facebookCargando, setFacebookCargando] = useState(false);

  // Guardamos los callbacks en refs para que el SDK de Google se inicialice
  // una sola vez, aunque el padre cree funciones nuevas en cada render.
  const onGoogleTokenRef = useRef(onGoogleToken);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onGoogleTokenRef.current = onGoogleToken;
    onErrorRef.current = onError;
  });

  // --- Google: se inicializa el SDK y se pinta el botón oficial. Ese botón
  // queda invisible encima de nuestro ícono (ver el JSX), así el logo siempre
  // se ve y el clic lo recibe el botón real de Google. ---
  useEffect(() => {
    if (googleEstado !== "ready" || !GOOGLE_CLIENT_ID || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (respuesta) => {
        if (respuesta?.credential) {
          onGoogleTokenRef.current?.(respuesta.credential);
        } else {
          onErrorRef.current?.("No se recibió la confirmación de Google.");
        }
      },
      auto_select: false,
      itp_support: true,
    });

    if (googleBotonRef.current) {
      googleBotonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleBotonRef.current, {
        type: "icon",
        shape: "circle",
        theme: "outline",
        size: "large",
      });
    }
  }, [googleEstado]);

  // --- Facebook: se inicializa el SDK; el login se dispara al hacer clic
  // en nuestro propio botón (debe ser un gesto directo del usuario). ---
  useEffect(() => {
    if (facebookEstado !== "ready" || !FACEBOOK_APP_ID) return;

    const inicializar = () => {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: "v21.0",
      });
      setFacebookListo(true);
    };

    if (window.FB) {
      inicializar();
    } else {
      window.fbAsyncInit = inicializar;
    }
  }, [facebookEstado]);

  const handleFacebookClick = (e) => {
    e.preventDefault();
    if (!FACEBOOK_APP_ID) {
      onError?.(
        "El login con Facebook no está configurado (falta VITE_FACEBOOK_APP_ID en el .env)."
      );
      return;
    }
    if (!facebookListo || !window.FB) {
      onError?.("Facebook todavía se está cargando, intenta de nuevo en un segundo.");
      return;
    }
    setFacebookCargando(true);
    window.FB.login(
      (respuesta) => {
        setFacebookCargando(false);
        const token = respuesta?.authResponse?.accessToken;
        if (token) {
          onFacebookToken?.(token);
        } else {
          onError?.("Se canceló el inicio de sesión con Facebook.");
        }
      },
      { scope: "public_profile,email" }
    );
  };

  const googleConfigurado = Boolean(GOOGLE_CLIENT_ID);
  const facebookConfigurado = Boolean(FACEBOOK_APP_ID);

  return (
    <div className="social-icons">
      {/* Botón de Google: el ícono de Font Awesome es lo que se ve; encima
          va el botón real del SDK, casi transparente, que recibe el clic. */}
      <span
        className={`icon icon-google${googleConfigurado ? "" : " icon-deshabilitado"}`}
        style={{ position: "relative", overflow: "hidden" }}
        title={
          googleConfigurado
            ? "Continuar con Google"
            : "Falta configurar VITE_GOOGLE_CLIENT_ID en el .env"
        }
      >
        <i className="fa-brands fa-google" aria-hidden="true"></i>
        {googleConfigurado && (
          <div
            ref={googleBotonRef}
            className="icon-google-boton"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.01,
              pointerEvents: disabled ? "none" : "auto",
            }}
          />
        )}
      </span>

      {/* Botón de Facebook: botón propio que dispara FB.login(). */}
      <button
        type="button"
        className="icon icon-facebook"
        onClick={handleFacebookClick}
        disabled={disabled || facebookCargando}
        title={
          facebookConfigurado
            ? "Continuar con Facebook"
            : "Falta configurar VITE_FACEBOOK_APP_ID en el .env"
        }
        aria-label="Continuar con Facebook"
      >
        <i className="fa-brands fa-facebook-f" aria-hidden="true"></i>
      </button>
    </div>
  );
}