import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8080,
    host: true,
    open: process.env.DOCKER !== 'true',
  },
  preview: {
    port: 8080,
    host: true,
  },
});
