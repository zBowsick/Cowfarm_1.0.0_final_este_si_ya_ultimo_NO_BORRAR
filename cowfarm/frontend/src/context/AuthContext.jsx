import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, clearToken, getToken, setToken, usuariosApi } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" = todavía estamos comprobando si hay una sesión guardada.
  const [loading, setLoading] = useState(true);

  const cargarUsuario = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await usuariosApi.me();
      setUser(me);
    } catch (err) {
      // Token inválido/expirado
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuario();
  }, [cargarUsuario]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    setToken(data.access_token, data.token_type);
    const me = await usuariosApi.me();
    setUser(me);
    return me;
  }, []);

  /**
   * Guarda una sesión que ya viene con token (login con Google o Facebook:
   * el backend ya verificó la identidad y devolvió el access_token listo).
   */
  const loginConToken = useCallback(async (data) => {
    setToken(data.access_token, data.token_type);
    const me = await usuariosApi.me();
    setUser(me);
    return me;
  }, []);

  const loginConGoogle = useCallback(
    async (credential) => loginConToken(await authApi.google(credential)),
    [loginConToken]
  );

  const loginConFacebook = useCallback(
    async (accessToken) => loginConToken(await authApi.facebook(accessToken)),
    [loginConToken]
  );

  const registrar = useCallback(async (payload) => {
    return usuariosApi.crear(payload);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    loginConGoogle,
    loginConFacebook,
    registrar,
    logout,
    refrescarUsuario: cargarUsuario,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
