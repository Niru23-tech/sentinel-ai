import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy is disabled so that /api/* requests stay in the browser,
    // allowing apiMock.ts to intercept them in standalone mode.
    // Uncomment the block below only when the FastAPI backend is running:
    //
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //     secure: false,
    //   }
    // }
  }
})
