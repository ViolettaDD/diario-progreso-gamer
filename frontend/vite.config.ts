import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, el proxy reenvía /api al backend local (puerto 3000).
// En producción no hay proxy: la dirección del API llega por VITE_API_URL.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
});
