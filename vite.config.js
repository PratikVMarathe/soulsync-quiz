import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'quizApp',
      filename: 'remoteEntry.js',
      exposes: {
        './QuizWidget': './src/App.jsx', 
      },
      // THIS MUST BE A SIMPLE ARRAY:
      shared: ['react', 'react-dom']
    })
  ],
  server: {
    port: 5001,
    strictPort: true,
    cors: true
  },
  preview: {
    port: 5001,
    strictPort: true,
    cors: true
  },
  build: {
    target: 'esnext'
  }
})