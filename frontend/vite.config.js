import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // ou '0.0.0.0' pour écouter sur toutes les interfaces
    port: 5173,
    strictPort: true, // Force l'utilisation du port 5173
    allowedHosts: [
      // 'destination-disclaimer-fees-election.trycloudflare.com',
      // '.trycloudflare.com',
      // '52a9-41-138-97-173.ngrok-free.app',
      // 'lyrics-generations-puerto-through.trycloudflare.com/'
        // Autorise tous les sous-domaines trycloudflare.com
        "*"

    ]
  }
})