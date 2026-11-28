import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
  },
  test: {
    environment: 'happy-dom',
  },
});
