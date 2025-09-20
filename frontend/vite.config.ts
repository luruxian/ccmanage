import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // Icon libraries
          'icons': ['@element-plus/icons-vue'],
          // Utils
          'utils': ['axios']
        }
      }
    },
    // Increase chunk size warning limit to 800kb (from default 500kb)
    chunkSizeWarningLimit: 800,
    // Enable source maps for better debugging in production
    sourcemap: false,
    // Minify options
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'esnext'
  },
  // CSS processing optimization
  css: {
    devSourcemap: false
  }
})
