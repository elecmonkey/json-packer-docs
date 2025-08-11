import tailwindcss from '@tailwindcss/vite'

export default {
    plugins: [
      tailwindcss()
    ],
    optimizeDeps: {
      exclude: ['json-packer-wasm']
    },
    server: {
      fs: {
        allow: ['..']
      },
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin'
      }
    },
    worker: {
      format: 'es'
    },
    build: {
      target: 'esnext'
    },
    define: {
      global: 'globalThis'
    }
  }