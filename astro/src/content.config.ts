import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

import { HeroTheme } from "@lib/hero-image";

const atotw = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/atotw" }),
  schema: z.object({
    title: z.string(),
    published: z.date(),
    summary: z.string(),
    who: z.string(),
    benefits: z.string(),
    tags: z.array(z.string()),
    theme: z.nativeEnum(HeroTheme).optional().default(HeroTheme.notes),
  }),
});

const blogs = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blogs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    published: z.date(),
    image: z.string().optional(),
    author: reference("staff"),
  }),
});

const collaborators = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.json",
    base: "./src/content/collaborators",
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      logo: image(),
      href: z.string().url(),
      tags: z.array(z.string()),
    }),
});

const daf = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/daf" }),
  schema: z.object({
    order: z.number().default(99999),
  }),
});

const escapeRoomKits = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/escape-room-kits",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      image: image(),
      order: z.number().default(99999),
    }),
});


const escapeRoomThemes = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/escape-room-themes",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tagline: z.string(),
      image: image(),
      alt: z.string().optional(),
      header: z.object({
        image: image(),
        color: z.string(),
      }),
    }),
});

const staff = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/staff" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      nickname: z.string().optional(),
      roles: z
        .object({
          default: z.string(),
          board: z.string(),
          communications: z.string(),
          content: z.string(),
          development: z.string(),
          evaluations: z.string(),
          leadership: z.string(),
          loca11y: z.string(),
          support: z.string(),
          ux: z.string(),
        })
        .partial(),
      current: z.boolean().default(true),
      picture: image(),
      alt: z.string().optional(),
      links: z
        .object({
          email: z.string().email(),
          facebook: z.string().url(),
          instagram: z.string().url(),
          linkedin: z.string().url(),
          mastodon: z.string().url(),
          threads: z.string().url(),
          twitter: z.string().url(),
          website: z.string().url(),
        })
        .partial()
        .optional(),
    }),
});

const recruiting = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/recruiting",
  }),
  schema: z.object({
    name: z.string(),
  }),
});

const teams = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/teams" }),
  schema: z.object({
    name: z.string(),
    recruiting: reference("recruiting").optional(),
    order: z.number().default(99999),
    management: z.boolean().default(false),
  }),
});

const quotes = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/quotes" }),
  schema: z.object({
    quotee: z.string(),
  }),
});

const testimonials = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/testimonials",
  }),
  schema: z.object({
    staff: reference("staff").optional(),
    person: z
      .object({
        name: z.string(),
        title: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = {
  atotw,
  blogs,
  collaborators,
  daf,
  escapeRoomKits,
  escapeRoomThemes,
  quotes,
  recruiting,
  staff,
  teams,
  testimonials,
};
