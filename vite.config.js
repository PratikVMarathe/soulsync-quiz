import process from 'node:process';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import { defineConfig, loadEnv } from 'vite';

const readPort = (env, key, fallbackPort) => {
  const value = Number.parseInt(env[key] || '', 10);
  return Number.isFinite(value) ? value : fallbackPort;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devPort = readPort(env, 'VITE_DEV_PORT', 5001);
  const previewPort = readPort(env, 'VITE_PREVIEW_PORT', devPort);

  return {
    plugins: [
      react(),
      federation({
        name: 'quizApp',
        filename: 'remoteEntry.js',
        exposes: {
          './QuizWidget': './src/App.jsx',
        },
        shared: ['react', 'react-dom'],
      }),
    ],
    server: {
      port: devPort,
      strictPort: true,
      cors: true,
    },
    preview: {
      port: previewPort,
      strictPort: true,
      cors: true,
    },
    build: {
      target: 'esnext',
      // The federation plugin rewrites string inputs incorrectly on Windows.
      rollupOptions: {
        input: {
          index: 'index.html',
        },
      },
    },
  };
});
