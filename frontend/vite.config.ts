import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('element-plus')) {
            return 'element-plus'
          }
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/pinia')) {
            return 'vue-vendor'
          }
          if (id.includes('@element-plus/icons-vue')) {
            return 'icons'
          }
          if (id.includes('node_modules/axios')) {
            return 'utils'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
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
