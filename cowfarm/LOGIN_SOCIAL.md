# Login con Google y Facebook — cómo activarlo

Los botones ya funcionan de punta a punta (frontend + backend verifican la
identidad de verdad). Lo único que falta es que TÚ crees las credenciales
en Google y Facebook, porque están atadas a tu dominio/app — nadie más
puede crearlas por ti.

Sin esto configurado, los botones se muestran deshabilitados con una pista
de qué falta (no rompen la página ni dan error feo).

---

## 1. Google

1. Entra a [Google Cloud Console → Credenciales](https://console.cloud.google.com/apis/credentials).
2. Crea un proyecto (o usa uno existente) → **Crear credenciales** →
   **ID de cliente de OAuth** → Tipo de aplicación: **Aplicación web**.
3. En **Orígenes de JavaScript autorizados** agrega las URLs donde corre tu
   frontend, por ejemplo:
   - `http://localhost:5173` (desarrollo)
   - `https://tudominio.com` (producción)
4. Copia el **Client ID** que te da (termina en `.apps.googleusercontent.com`).
5. Pégalo en **dos lugares** del **único** archivo `.env` de la raíz del
   proyecto (debe ser el mismo valor en ambos):

   **Backend** — variable `GOOGLE_CLIENT_ID`
   ```
   GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
   ```

   **Frontend** — variable `VITE_GOOGLE_CLIENT_ID`
   ```
   VITE_GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
   ```

No se necesita "Client Secret" para este flujo (Google Identity Services
en el navegador solo requiere el Client ID).

---

## 2. Facebook

1. Entra a [developers.facebook.com/apps](https://developers.facebook.com/apps)
   y crea una app de tipo **Consumidor**.
2. Agrega el producto **Facebook Login** → Configuración → en
   **URI de redireccionamiento de OAuth válidos** y **Dominios de la app**
   agrega tu dominio (para desarrollo: `localhost`).
3. Ve a **Configuración → Básica** y copia el **ID de la app** y el
   **Secreto de la app** (clic en "Mostrar").
4. Pégalos en el **único** archivo `.env` de la raíz del proyecto:

   **Backend** — variables `FACEBOOK_APP_ID` y `FACEBOOK_APP_SECRET`
   ```
   FACEBOOK_APP_ID=1234567890123456
   FACEBOOK_APP_SECRET=el_secreto_que_copiaste
   ```

   **Frontend** — variable `VITE_FACEBOOK_APP_ID`
   ```
   VITE_FACEBOOK_APP_ID=1234567890123456
   ```

   El **Secreto** solo va en el backend. Nunca lo pongas en el frontend
   (`VITE_...`), porque cualquiera podría verlo en el navegador.

5. Mientras la app esté en **modo Desarrollo** (así arranca toda app nueva
   de Facebook), solo pueden iniciar sesión los usuarios que agregues como
   **Administradores/Desarrolladores/Testers** en
   **Roles de la app → Roles**. Para que cualquier persona pueda usarlo,
   hay que pasar la app a **modo Live** (Facebook puede pedir verificar la
   app y el permiso `email` si vas a producción).

---

## 3. Reinicia el proyecto

```bash
# Levanta la API y el frontend a la vez (un solo comando)
python run.py
```

Los botones (los círculos con la "G" y la "f" en el login) ya deberían
abrir la ventana de Google/Facebook y, al aceptar, entrar directo a la
cuenta.

---

## Cómo funciona por dentro

- **Nunca confiamos en lo que dice el navegador.** El frontend solo reenvía
  el token que Google/Facebook le entregan; el backend lo verifica
  directamente contra los servidores de Google/Facebook antes de creer que
  ese es realmente el usuario.
- **Primera vez con ese correo:** se crea una cuenta nueva con rol
  `comprador` (se puede cambiar después desde el Panel Admin → Usuarios).
- **Ya existía una cuenta local con ese mismo correo:** se vincula el
  login social a esa cuenta (conserva su rol de siempre); no se duplica.
- La contraseña de las cuentas creadas por Google/Facebook se guarda como
  un valor aleatorio e inutilizable: esas cuentas solo pueden entrar con
  el mismo proveedor, nunca con email + contraseña.
