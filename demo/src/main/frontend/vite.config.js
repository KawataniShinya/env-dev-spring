import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../resources/static/dist', // Spring Boot から参照可能な場所
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'main.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  server: {
    watch: {
      usePolling: true,
    },
    allowedHosts: ['localhost.spring-app-dev.sample.jp'],
  }
})
