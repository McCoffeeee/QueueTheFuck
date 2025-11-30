import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    https: {
      key: './certs/127.0.0.1-key.pem',
      cert: './certs/127.0.0.1.pem',
    },
    host: '127.0.0.1',
    port: 5173,
  },
  define: {
    _global: ({})
  }
})