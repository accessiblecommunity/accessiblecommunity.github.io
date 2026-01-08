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

const markdown = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/markdown" }),
})

const policies = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/policies",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
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
    title: z.string(),
    description: z.string(),
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
      buttonText: z.string().optional().default("Learn more"),
      href: z.string().optional(),
      page: z.object({
        image: image(),
        theme: z.string().default("dark"),
      }),
      about: z
        .object({
          players: z.string().optional(),
          length: z.string().optional(),
          estimatedMaterialCost: z.number().optional(),
        })
        .default({}),
    }),
});

const nameSchema = z.object({
  first: z.string(),
  middle: z.string().optional(),
  last: z.string().optional(),
});

const staff = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/staff" }),
  schema: ({ image }) =>
    z.object({
      name: nameSchema,
      cited: nameSchema.optional(),
      photo: z
        .object({
          image: image(),
          alt: z.string().optional(),
        })
        .default({
          // @ts-ignore: String path required.
          image: "/src/images/staff/Ta11yCat.png",
          alt: "The Tally Cat has claimed this spot.",
        }),
      current: z.boolean().default(true),
      roles: z
        .object({
          default: z.string(),
          board: z.string(),
          communications: z.string(),
          content: z.string(),
          day_in_the_life: z.string(),
          development: z.string(),
          escape_room: z.string(),
          evaluations: z.string(),
          globa11y: z.string(),
          leadership: z.string(),
          loca11y: z.string(),
          support: z.string(),
          ux: z.string(),
        })
        .partial(),
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
    branded: z.boolean().default(false),
    recruiting: reference("recruiting").optional(),
    order: z.number().default(99999),
    management: z.boolean().default(false),
  }),
});

const quotes = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/quotes" }),
  schema: z.object({
    quotee: z.string().optional(),
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
  markdown,
  quotes,
  policies,
  recruiting,
  staff,
  teams,
  testimonials,
};
