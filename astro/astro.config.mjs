import path from "path";
import { fileURLToPath } from "url";

// https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import styleGuide from "./style-guide/register.js";

import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import robotsTxt from "astro-robots-txt";
import sitemap from "@astrojs/sitemap";

const localEnv = loadEnv(process.env.NODE_ENV, process.cwd(), "");
const usePolling = (localEnv.FS_POLLING === 'true');
const botsToDisallow = [
  "anthropic-ai",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "ClaudeBot",
  "Claude-Web",
  "cohere-ai",
  "Diffbot",
  "FacebookBot",
  "Google-Extended",
  "GPTBot",
  "Meta-ExternalAgent",
  "omgili",
  "Timpibot",
];

// https://astro.build/config
export default defineConfig({
  site: "https://accessiblecommunity.org",
  server: {
    host: true,
  },
  redirects: {
    "/daf/overview/": "/daf/",
  },
  vite: {
    resolve: {
      alias: {
        "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
        "~bootstrap-es": path.resolve(
          __dirname,
          "node_modules/bootstrap/dist/js/bootstrap.esm.min.js",
        ),
        '@': './src',
      },
      extensions: ['.js', '.ts', '.mjs'],
    },
    ssr: {
      noExternal: ["bootstrap"],
    },
    // https://vitejs.dev/config/server-options#server-watch
    watch: {
      usePolling,
    },
  },
  integrations: [
    mdx(),
    styleGuide(), 
    icon({
      include: {
        // Bootstrap Icons
        bi: [
          // Navigation
          'arrow-down-square', 'arrow-up-right-square', 'list',
          // Contact Info
          'envelope-at-fill', 'telephone-fill', 'geo-alt-fill',
          // Social Media
          'facebook', 'instagram', 'linkedin', 'rss-fill', 'tiktok', 'youtube',
          // Descriptive
          'gift-fill', 'pencil-fill', 'people-fill', 'person-fill',
        ],
        // CoreUI Brands
        cib: [
          // Social Media
          'facebook', 'instagram', 'linkedin', 'mastodon', 'twitter',
          // Payment
          "cc-paypal", "cc-stripe", "paypal", "stripe",
        ],
      }
    }),
    sitemap({
      filter: (page) => !page.endsWith('/commitment-form/') && !page.endsWith('fixable/'),
    }),
    robotsTxt({
      sitemap: true,
      policy: [
        ...botsToDisallow.map((userAgent) => ({
          userAgent,
          disallow: ['/'],
        })),
        {
          userAgent: '*',
          disallow: ['/fixable/'],
        },
        {
          userAgent: '*',
          allow: ['/'],
        },
      ]
    })
  ],
});
