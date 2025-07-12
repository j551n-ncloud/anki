import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config with allowed host
export default defineConfig({
  plugins: [react()],
  server: {
    port: 88,       // Set the desired port
    host: true,     // Allow external access
    allowedHosts: [
      'anki.j551n.com', // Add the allowed host here
    ],
  },
})
