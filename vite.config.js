import { cpSync, copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const root = process.cwd();

export default defineConfig({
  base: "./",
  publicDir: false,
  plugins: [
    {
      name: "copy-static-project-assets",
      closeBundle() {
        const output = resolve(root, "dist");

        for (const directory of ["css", "img", "lib", "mail", "frames"]) {
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
});
