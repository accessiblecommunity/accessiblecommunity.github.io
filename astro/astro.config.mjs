import { defineConfig, envField } from "astro/config";
import { remarkDefinitionList, defListHastHandlers } from 'remark-definition-list';
import styleGuide from "./style-guide/register.js";

import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import robotsTxt from "astro-robots-txt";
import sitemap from "@astrojs/sitemap";

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

export default defineConfig({
  site: "https://accessiblecommunity.org",
  output: 'static',
  adapter: netlify(),

  server: {
    host: true,
  },

  redirects: {
    "/daf/overview/": "/daf/",
    // Move old services URLs to new ones.
    "/services/escape-room": "/escape-room/",
    "/services/evaluations": "/evaluations/",
    "/services/globa11y/": "/globa11y/",
    "/services/mutua11y/": "/mutua11y/",
    "/services/tip-of-the-week": "/tips/",
    // Redirect to Github projects
    "/fixable": "https://accessiblecommunity.github.io/fixable/",
    "/useable": "https://accessiblecommunity.github.io/useable/",
  },

  vite: {
    ssr: {
      noExternal: ["bootstrap"],
    },
  },

  env: {
    schema: {
      BETTER_AUTH_SECRET: envField.string({ context: "server", access: "secret", optional: false }),
      BETTER_AUTH_URL: envField.string({ context: "server", access: "public", }),
      DATABASE_URL: envField.string({ context: "server", access: "secret", optional: false }),
      RESEND_API_KEY: envField.string({ context: "server", access: "secret", optional: false }),
      // TODO: Remove later.
      TEST_EMAIL: envField.string({ context: "server", access: "public", optional: false }),
    }
  },

  markdown: {
    remarkPlugins: [ remarkDefinitionList, ],
    remarkRehype: { handlers: defListHastHandlers },
  },

  integrations: [mdx(), react(), styleGuide(), icon({
    include: {
      // Bootstrap Icons
      bi: [
        // Navigation
        'arrow-down-square', 'arrow-up-right-square', 'arrow-right-square', 'list',
        // Contact Info
        'envelope-at-fill', 'telephone-fill', 'geo-alt-fill',
        // Social Media
        'facebook', 'instagram', 'linkedin', 'rss-fill', 'tiktok', 'globe', 'mastodon', 'twitter',
        'github',
        // Descriptive
        'gift-fill', 'pencil-fill', 'people-fill', 'person-fill',
        // Additional icons
        'check-circle-fill', 'exclamation-triangle-fill', 'file-text-fill', 'display-fill', 'puzzle-fill', 'tools',
        'gift-fill', 'pencil-fill', 'people-fill', 'person-fill', 'puzzle-fill', 'stopwatch-fill', 'tools',
      ],
      // CoreUI Brands
      cib: [
        // Social Media
        'facebook', 'instagram', 'linkedin', 'mastodon', 'twitter',
        // Streaming
        'apple-podcasts', 'youtube',
        // Payment
        "cc-paypal", "cc-stripe", "paypal", "stripe",
      ],
      'simple-icons': [
        // Streaming
        'podcastindex'
      ],
    }
  }), sitemap({
    filter: (page) =>
      !page.endsWith('/commitment-form/') &&
      !page.includes('/fixable/') &&
      !page.includes('/services/escape-room/content/') &&
      !page.endsWith('tips/archive/')
  }), robotsTxt({
    sitemap: true,
    policy: [
      // Block specified bots entirely
      ...botsToDisallow.map((userAgent) => ({
        userAgent,
        disallow: ['/'],
      })),
      // General user-agent rules
      {
        userAgent: '*',
        allow: ['/', '/materials/basic/'],
        disallow: [
          '/fixable/',
          '/materials/premium/',
          '/protected-materials/',
          '/api/download-material',
          '/api/digital-content',
          '/api/verify-purchase',
          '/services/escape-room/content/',
          '/tips/archive/',
        ],
      },
    ]
  })],
});