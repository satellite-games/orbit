/// <reference types="vitest" />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['./tests/vitest/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      all: true,
      include: ['lib/**/*.ts'],
      exclude: ['lib/*.ts', 'lib/locales/**/*', 'lib/**/*index.ts', '**/*types.ts', '**/*mocks.ts'],
      reportsDirectory: 'reports/vitest/coverage',
      reporter: ['text', 'cobertura'],
    },
  },
});
