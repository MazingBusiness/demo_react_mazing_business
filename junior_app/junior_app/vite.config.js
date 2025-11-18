import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For local server
// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

// For git upload
export default defineConfig({
  plugins: [react()],
  base: "/demo_react_mazing_business_second",
})