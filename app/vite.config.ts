import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase/supabase-js')) return 'supabase'
            if (id.includes('recharts')) return 'charts'
            if (id.includes('date-fns')) return 'dates'
            if (id.includes('ical.js')) return 'ical'
            if (id.includes('pdfjs-dist')) return 'pdfjs'
            if (id.includes('react')) return 'vendor'
            return 'vendor'
          }
        },
      },
    },
  },
})
