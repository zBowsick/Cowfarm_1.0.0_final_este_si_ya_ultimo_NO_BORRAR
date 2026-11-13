

// La URL base de la API sale del `.env` UNICO de la raíz del proyecto
// (VITE_API_BASE_URL). Si no está definida se usa el backend local.
// Si se define como VACÍA (VITE_API_BASE_URL=) las llamadas son relativas al
// propio origen: es lo que se usa cuando el frontend compilado lo sirve el
// backend en el mismo servidor (python run.py prod).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const TOKEN_KEY = "cowfarm_token";
const TOKEN_TYPE_KEY = "cowfarm_token_type";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token, tokenType = "bearer") {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_TYPE_KEY);
}

// Convierte la respuesta de error de FastAPI (que puede ser un string
// o una lista de errores de validación) en un mensaje legible.
function extraerMensajeError(data, fallback) {
  if (!data) return fallback;
  if (Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg).join(", ");
  }
  return data.detail || fallback;
}

/**
 * Petición genérica a la API. Añade automáticamente el token (si existe)
 * y parsea la respuesta como JSON. Lanza un Error con mensaje legible
 * si la respuesta no es ok.
 */
export async function apiFetch(path, { auth = false, headers, body, ...options } = {}) {
  const finalHeaders = { ...(headers || {}) };

  // FormData (subida de archivos) y URLSearchParams (login) se envían tal cual.
  // Con FormData NO se debe fijar Content-Type: el navegador lo pone solo,
  // incluyendo el "boundary" que necesita el servidor para leer el archivo.
  const esFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const esUrlEncoded = body instanceof URLSearchParams;

  if (body !== undefined && !esUrlEncoded && !esFormData) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: finalHeaders,
      body:
        body !== undefined && !esUrlEncoded && !esFormData
          ? JSON.stringify(body)
          : body,
    });
  } catch (err) {
    throw new Error("No se pudo conectar con el servidor. ¿Está el backend corriendo?");
  }

  // 204 No Content no trae body
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extraerMensajeError(data, `Error ${response.status}`));
  }

  return data;
}

/**
 * Las imágenes subidas al servidor se guardan como ruta relativa
 * ("/uploads/productos/abc.jpg"). Esta función las convierte en una URL
 * completa apuntando al backend. Las URLs externas (http...) y las imágenes
 * locales del frontend ("/images/logo-1.png") se devuelven sin tocar.
 */
export function resolverUrlImagen(url) {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
  return url;
}

/** Convierte "Frutas Frescas del Huila" en "frutas-frescas-del-huila". */
export function generarSlug(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

// --- Endpoints agrupados por recurso ---

export const authApi = {
  login: (email, password) => {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);
    return apiFetch("/auth/login", { method: "POST", body });
  },
  // El frontend nunca decide quién es el usuario: solo reenvía al backend
  // el token que Google/Facebook entregaron, y el backend lo verifica.
  google: (credential) => apiFetch("/auth/google", { method: "POST", body: { credential } }),
  facebook: (accessToken) =>
    apiFetch("/auth/facebook", { method: "POST", body: { access_token: accessToken } }),
};

export const usuariosApi = {
  crear: (payload) => apiFetch("/usuarios/", { method: "POST", body: payload }),
  me: () => apiFetch("/usuarios/me", { auth: true }),
  listar: () => apiFetch("/usuarios/", { auth: true }),
  obtener: (id) => apiFetch(`/usuarios/${id}`, { auth: true }),
  actualizar: (id, payload) =>
    apiFetch(`/usuarios/${id}`, { method: "PUT", auth: true, body: payload }),
  cambiarRol: (id, rol) =>
    apiFetch(`/usuarios/${id}/rol`, { method: "PATCH", auth: true, body: { rol } }),
  eliminar: (id) => apiFetch(`/usuarios/${id}`, { method: "DELETE", auth: true }),
};

export const direccionesApi = {
  listarPorUsuario: (usuarioId) =>
    apiFetch(`/direcciones/usuario/${usuarioId}`, { auth: true }),
  crear: (payload) =>
    apiFetch("/direcciones/", { method: "POST", auth: true, body: payload }),
  actualizar: (id, payload) =>
    apiFetch(`/direcciones/${id}`, { method: "PUT", auth: true, body: payload }),
  eliminar: (id) => apiFetch(`/direcciones/${id}`, { method: "DELETE", auth: true }),
};
  
export const categoriasApi = {
  listar: () => apiFetch("/categorias/"),
  obtener: (id) => apiFetch(`/categorias/${id}`),
  obtenerPorSlug: (slug) => apiFetch(`/categorias/slug/${encodeURIComponent(slug)}`),
  crear: (payload) => apiFetch("/categorias/", { method: "POST", auth: true, body: payload }),
  actualizar: (id, payload) =>
    apiFetch(`/categorias/${id}`, { method: "PUT", auth: true, body: payload }),
  // Sube la imagen de portada de la categoría desde el computador o el celular
  subirImagen: (id, archivo) => {
    const datos = new FormData();
    datos.append("archivo", archivo);
    return apiFetch(`/categorias/${id}/imagen`, { method: "POST", auth: true, body: datos });
  },
  eliminar: (id) => apiFetch(`/categorias/${id}`, { method: "DELETE", auth: true }),
};

export const productosApi = {
  listar: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    ).toString();
    return apiFetch(`/productos/${qs ? `?${qs}` : ""}`);
  },
  obtener: (id) => apiFetch(`/productos/${id}`),
  crear: (payload) => apiFetch("/productos/", { method: "POST", auth: true, body: payload }),
  actualizar: (id, payload) =>
    apiFetch(`/productos/${id}`, { method: "PUT", auth: true, body: payload }),
  eliminar: (id) => apiFetch(`/productos/${id}`, { method: "DELETE", auth: true }),
};

export const productoImagenesApi = {
  // Registra una imagen que ya está publicada en internet (por URL)
  crear: (payload) =>
    apiFetch("/producto-imagenes/", { method: "POST", auth: true, body: payload }),

  /**
   * Sube un archivo de imagen elegido por el usuario (galería, archivos o
   * cámara del celular). Se envía como multipart/form-data.
   */
  subir: (productoId, archivo) => {
    const datos = new FormData();
    datos.append("producto_id", String(productoId));
    datos.append("archivo", archivo);
    return apiFetch("/producto-imagenes/upload", { method: "POST", auth: true, body: datos });
  },

  /** Igual que `subir`, pero con varias imágenes de una sola vez. */
  subirVarias: (productoId, archivos) => {
    const datos = new FormData();
    datos.append("producto_id", String(productoId));
    Array.from(archivos).forEach((archivo) => datos.append("archivos", archivo));
    return apiFetch("/producto-imagenes/upload-multiple", {
      method: "POST",
      auth: true,
      body: datos,
    });
  },

  listarPorProducto: (productoId) => apiFetch(`/producto-imagenes/producto/${productoId}`),
  eliminar: (imagenId) =>
    apiFetch(`/producto-imagenes/${imagenId}`, { method: "DELETE", auth: true }),
};

export const pedidosApi = {
  crear: (payload) => apiFetch("/pedidos/", { method: "POST", auth: true, body: payload }),
  listar: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    ).toString();
    return apiFetch(`/pedidos/${qs ? `?${qs}` : ""}`, { auth: true });
  },
  obtener: (id) => apiFetch(`/pedidos/${id}`, { auth: true }),
  actualizarEstado: (id, estado) =>
    apiFetch(`/pedidos/${id}/estado`, { method: "PATCH", auth: true, body: { estado } }),
  asignarDistribuidor: (id, distribuidorId) =>
    apiFetch(`/pedidos/${id}/distribuidor`, {
      method: "PATCH",
      auth: true,
      body: { distribuidor_id: distribuidorId },
    }),
  cancelar: (id) => apiFetch(`/pedidos/${id}`, { method: "DELETE", auth: true }),
};

export const pagosApi = {
  listarPorPedido: (pedidoId) => apiFetch(`/pagos/pedido/${pedidoId}`, { auth: true }),
  obtener: (id) => apiFetch(`/pagos/${id}`, { auth: true }),
  crear: (payload) => apiFetch("/pagos/", { method: "POST", auth: true, body: payload }),
  actualizarEstado: (id, estado) =>
    apiFetch(`/pagos/${id}/estado`, { method: "PATCH", auth: true, body: { estado } }),
};

export const ventasApi = {
  listar: () => apiFetch("/ventas/", { auth: true }),
};

export const proveedoresApi = {
  listar: () => apiFetch("/proveedores/", { auth: true }),
  obtener: (id) => apiFetch(`/proveedores/${id}`, { auth: true }),
  crear: (payload) => apiFetch("/proveedores/", { method: "POST", auth: true, body: payload }),
  actualizar: (id, payload) =>
    apiFetch(`/proveedores/${id}`, { method: "PUT", auth: true, body: payload }),
  eliminar: (id) => apiFetch(`/proveedores/${id}`, { method: "DELETE", auth: true }),
};

export const metodosPagoApi = {
  listar: (soloActivos = false) =>
    apiFetch(`/metodos-pago/${soloActivos ? "?solo_activos=true" : ""}`),
  crear: (payload) => apiFetch("/metodos-pago/", { method: "POST", auth: true, body: payload }),
  actualizar: (id, payload) =>
    apiFetch(`/metodos-pago/${id}`, { method: "PUT", auth: true, body: payload }),
  eliminar: (id) => apiFetch(`/metodos-pago/${id}`, { method: "DELETE", auth: true }),
};

export const contactoApi = {
  enviar: (payload) => apiFetch("/contacto/", { method: "POST", body: payload }),
};
