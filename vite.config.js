import { cpSync, copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = process.cwd();

export default defineConfig({
  base: "/",
  publicDir: false,
  plugins: [
    react(),
    {
      name: "copy-static-project-assets",
      closeBundle() {
        const output = resolve(root, "dist");

        for (const directory of ["img", "mail"]) {
          const source = resolve(root, directory);
          if (existsSync(source)) {
            cpSync(source, resolve(output, directory), { recursive: true });
          }
        }

        copyFileSync(
          resolve(output, "index.html"),
          resolve(output, "404.html"),
        );
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
            "firebase/storage",
            "firebase/functions",
          ],
        },
      },
    },
  },
});
