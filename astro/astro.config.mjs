import path from "path";
import { fileURLToPath } from "url";

// https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { defineConfig } from "astro/config";
import styleGuide from "./style-guide/register.js";

import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.accessiblecommunity.org",
  server: {
    host: true,
  },
  vite: {
    resolve: {
      alias: {
        "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
        "~bootstrap-es": path.resolve(
          __dirname,
          "node_modules/bootstrap/dist/js/bootstrap.esm.min.js",
        ),
      },
    },
    ssr: {
      noExternal: ["bootstrap"],
    },
  },
  integrations: [
    mdx(),
    styleGuide(), 
    icon({
      include: {
        bi: [
          // Navigation
          'arrow-down-square', 'arrow-up-right-square', 'list',
          // Social Media
          'facebook', 'instagram', 'linkedin', 'tiktok',
          // Descriptive
          'gift-fill', 'pencil-fill', 'people-fill', 'person-fill',
        ],
        cib: [
          "cc-paypal", "cc-stripe", "paypal", "stripe",
        ],
      }
    }),
    sitemap({
      filter: (page) => !page.endsWith('/commitment-form/'),
    }),
  ],
});
