import { defineConfig } from 'vitest/config';
import { pagesBase } from './src/pages-base';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? pagesBase() : '/',
  server: {
    port: 8080,
    host: true,
    open: process.env.DOCKER !== 'true',
  },
  preview: {
    port: 8080,
    host: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/simulation.ts',
        'src/manual-steer.ts',
        'src/manual-steer-3d.ts',
        'src/behaviors.ts',
        'src/pages-base.ts',
        'src/sync.ts',
        'src/ui.ts',
        'src/constants.ts',
        'src/terrain.ts',
        'src/aircraft-speed.ts',
        'src/input.ts',
      ],
    fileParallelism: false,
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
});
