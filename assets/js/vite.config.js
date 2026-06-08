import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configurazione Vite. base './' rende il build deployabile anche su sottocartelle
// (es. GitHub Pages) senza modifiche ai path.
export default defineConfig({
  plugins: [react()],
  base: './',
})
