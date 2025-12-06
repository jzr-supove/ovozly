// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default defineConfig({
    plugins: [react(), viteTsconfigPaths()],
    resolve: {
        extensions: [".mjs", ".js", ".jsx", ".tsx", ".ts"],
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
