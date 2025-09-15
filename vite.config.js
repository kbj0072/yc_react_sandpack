import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/yc_react_sandpack/", // GitHub Pages repo 이름과 일치
  plugins: [react()],
  build: {
    outDir: "dist",
    target: "esnext",
  },
});
