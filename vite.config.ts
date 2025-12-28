import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Safely access process.cwd() by casting to any to avoid TS errors in some environments
  const cwd = (process as any).cwd();
  const env = loadEnv(mode, cwd, '');

  return {
    plugins: [react()],
    define: {
      // This securely maps the system environment variable to the code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      outDir: 'dist',
    }
  };
});