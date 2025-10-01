import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Get current date and time for build info
    const buildDate = new Date().toISOString().split('T')[0];
    const buildTime = new Date().toTimeString().split(' ')[0];
    
    // Read version from package.json
    const packageJson = require('./package.json');
    const version = packageJson.version;
    
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
        '__APP_VERSION__': JSON.stringify(version),
        '__BUILD_DATE__': JSON.stringify(buildDate),
        '__BUILD_TIME__': JSON.stringify(buildTime)
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunks
              'react-vendor': ['react', 'react-dom'],
              'ui-vendor': ['lucide-react'],
              'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
              
              // Core LLM communication libraries (but not service implementations)
              'http-vendor': ['axios'],
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
        allowedHosts: ['app.3z5.de','chesstrax-ai-coach.vercel.app']  // Hier deinen Host eintragen; Array für mehrere möglich
      }
    };
});
