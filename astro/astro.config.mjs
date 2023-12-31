import { defineConfig } from 'astro/config';
import path from 'path';
import { fileURLToPath } from 'url';
import styleGuide from './style-guide/register.js'

// https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  site: 'https://accessiblecommunity.github.io',
  server: { host: true },
  vite: {
    resolve: {
      alias: {
        '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        '~bootstrap-es': path.resolve(__dirname, 'node_modules/bootstrap/dist/js/bootstrap.esm.min.js'),
      }
    },
    ssr: {
      noExternal: ['bootstrap'],
    },
  },
  integrations: [
    styleGuide(),
  ]
});
