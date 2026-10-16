import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In production builds: no source maps and no console/debugger statements,
// so the internal code is not exposed in the browser.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    sourcemap: false,
  },
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
}));
