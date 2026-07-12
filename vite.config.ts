import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/claude-tetris/',
  test: {
    environment: 'node',
  },
});
