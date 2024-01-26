import path from 'path';
import { fileURLToPath } from 'url';

// https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { defineConfig } from 'astro/config';
import styleGuide from './style-guide/register.js';
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://www.accessiblecommunity.org',
  server: {
    host: true
  },
  vite: {
    resolve: {
      alias: {
        '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        '~bootstrap-es': path.resolve(__dirname, 'node_modules/bootstrap/dist/js/bootstrap.esm.min.js')
      }
    },
    ssr: {
      noExternal: ['bootstrap']
    }
  },
  integrations: [styleGuide(), mdx(), sitemap()]
});