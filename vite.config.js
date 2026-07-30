import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        onlyExplicitManualChunks: true,
        manualChunks(id) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) {
            return 'react'
          }
          if (id.includes('/node_modules/three/')) {
            return 'three'
          }
          if (id.includes('/node_modules/@react-three/postprocessing/') || id.includes('/node_modules/postprocessing/')) {
            return 'effects'
          }
          if (id.includes('/node_modules/@react-three/') || id.includes('/node_modules/react-reconciler/')) {
            return 'react-three'
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
