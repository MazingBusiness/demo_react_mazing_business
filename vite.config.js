import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

// --------------- WHEN BUILD OPEN THE BELOW CODE. AND CLOSE THE ABOVE CODE ----------------
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// export default defineConfig({
//   plugins: [react()],
//   base: "/mazing_react_website/",
// });

// --------------- WHEN UPLOAD THE BELOW CODE INTO GITHUB ----------------
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: "/demo_react_mazing_business",
});
