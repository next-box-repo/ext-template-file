import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@public': path.resolve(__dirname, 'public'),
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        entryFileNames: "static/js/[name].[hash].js",
        chunkFileNames: "static/js/[name].[hash].js",
        assetFileNames: ({ name }) => {
          if (/\.css$/.test(name ?? "")) {
            return "static/css/[name].[hash].[ext]";
          }
          return "static/media/[name].[hash].[ext]";
        },
      },
    },
    assetsDir: "static/media",
  },
  // NOTE: Нужно для работы библиотеки excalidraw
  define: {
    'process.env': {}
  }
});
