import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // El frontend vive en `frontend/`, pero la configuración del proyecto
  // (API base URL, Google/Facebook client IDs) está en el ÚNICO `.env`
  // de la raíz del proyecto unificado, junto con la del backend.
  // `envDir` le dice a Vite dónde buscar ese archivo.
  envDir: '..',

  server: {
    port: 5173,
    host: true,
  },

  // Compilación de producción: se genera en `frontend/dist`, que es lo que
  // el backend sirve cuando se ejecuta `python run.py prod`.
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
