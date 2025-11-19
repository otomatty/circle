import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'coverage/',
        '**/*.config.*',
        '**/types/**',
        '**/*.d.ts',
        '**/mock-data/**',
        '**/migrations/**',
      ],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './'),
      '~/components': path.resolve(__dirname, './components'),
      '~/lib': path.resolve(__dirname, './lib'),
      '~/lib/test-utils': path.resolve(__dirname, './lib/test-utils/index'),
      '~/actions': path.resolve(__dirname, './actions'),
      '~/utils': path.resolve(__dirname, './utils'),
      '~/types': path.resolve(__dirname, './types'),
      '~/hooks': path.resolve(__dirname, './hooks'),
      '~/store': path.resolve(__dirname, './store'),
      '~/config': path.resolve(__dirname, './config'),
    },
  },
});

