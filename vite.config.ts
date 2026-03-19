import path from 'path';
import { createRequire } from 'module';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Get current date and time for build info
  const buildDate = new Date().toISOString().split('T')[0];
  const buildTime = new Date().toTimeString().split(' ')[0];

  // Read version from package.json (createRequire für ESM-Kompatibilität mit Vite 8)
  const packageJson = require('./package.json');
  const version = packageJson.version;

  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
      'process.env.VITE_GA_MEASUREMENT_ID': JSON.stringify(env.MESS_ID || env.VITE_MESS_ID || ''),
      '__APP_VERSION__': JSON.stringify(version),
      '__BUILD_DATE__': JSON.stringify(buildDate),
      '__BUILD_TIME__': JSON.stringify(buildTime)
    },
    build: {
      rollupOptions: {
        output: {
          // Rolldown (Vite 8) erfordert manualChunks als Funktion
          manualChunks(id) {
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('i18next')) {
              return 'i18n-vendor';
            }
            if (id.includes('axios')) {
              return 'http-vendor';
            }
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    server: {  // Neu hinzugefügtes Objekt
      allowedHosts: ['app.3z5.de', 'chesstrax-ai-coach.vercel.app'],  // Hier deinen Host eintragen; Array für mehrere möglich
      proxy: {
        '/api': {
          target: 'http://localhost:3020',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});
