import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

// Konfigurasi test runner Vitest (Nuxt memakai nuxt.config.ts untuk build aplikasi).
export default defineConfig({
  plugins: [vue()],
  define: {
    DELCOM_BASEURL: JSON.stringify('https://open-api.delcom.org/api/v1'),
  },
  resolve: {
    alias: { '~': srcDir, '@': srcDir },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts', 'src/setupTests.ts', 'src/test-utils.ts'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
})
