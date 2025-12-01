import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['./src/**/*.{test,spec}.{ts,tsx}', './src/**/*.integration.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', './tests/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        './src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        '**/build/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.integration.test.{ts,tsx}',
      ],
      include: ['./src/**/*.{ts,tsx}'],
    },
  },
});
