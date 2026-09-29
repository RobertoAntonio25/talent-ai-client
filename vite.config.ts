import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ["VITE_", "VIT_"],
  build: {
    // 6.4: el chunk principal supera 500kB por dnd-kit + jspdf + supabase.
    // Con lazy() en router ya se code-splittea; subimos el límite para no
    // ensuciar el log de Vercel con un warning conocido y aceptado.
    chunkSizeWarningLimit: 1200,
  },
});
