// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
// })

// --------------- WHEN BUILD OPEN THE BELOW CODE. AND CLOSE THE ABOVE CODE ----------------
// ------------------------------ Mazing Live -----------------------------
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    proxy: {
      "/abm-api": {
        target: "https://abm.spurspaces.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/abm-api/, ""),
      },
    },
  },
});

// ------------------------------ Mazing Development -----------------------------
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   base: "/mazing_react_website/",
//   server: {
//     proxy: {
//       "/abm-api": {
//         target: "https://abm.spurspaces.com",
//         changeOrigin: true,
//         secure: true,
//         rewrite: (path) => path.replace(/^\/abm-api/, ""),
//       },
//     },
//   },
// });

// --------------- WHEN UPLOAD THE BELOW CODE INTO GITHUB ----------------
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// export default defineConfig({
//   plugins: [react()],
//   base: "/demo_react_mazing_business",
// });
