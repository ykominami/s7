import { resolve } from 'node:path';
import { defineConfig } from 'vite';
 
export default defineConfig((opt) => {
  return {
    root: 'src',
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'src/hello.html')
        },
        output: {
          entryFileNames: '[name].js',
        },
      },
    },
  };
});