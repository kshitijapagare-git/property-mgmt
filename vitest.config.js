import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    /* The repo has no tests yet. Without this, `vitest run` exits non-zero on an empty suite and
       the verify gate reports a test failure for a change that simply has not added tests yet. */
    passWithNoTests: true,
  },
});
