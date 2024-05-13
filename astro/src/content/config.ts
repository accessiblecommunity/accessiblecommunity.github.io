import { defineCollection, reference, z } from "astro:content";

const atotw = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    published: z.date(),
    summary: z.string(),
    who: z.string(),
    benefits: z.string(),
    tags: z.array(z.string()),
  }),
});

const blogs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    published: z.date(),
    image: z.string().optional(),
    author: reference("team"),
  }),
});

const collaborators = defineCollection({
  type: "data",
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      logo: image(),
      href: z.string().url(),
      tags: z.array(z.string()),
    }),
});

const team = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      nickname: z.string().optional(),
      roles: z.object({
        "default": z.string(),
        "board": z.string(),
        "content": z.string(),
        "development": z.string(),
        "evaluations": z.string(),
        "leadership": z.string(),
        "loca11y": z.string(),
        "social": z.string(),
        "support": z.string(),
        "ux": z.string(),
      }).partial().optional(),
      picture: image(),
      alt: z.string().optional(),
      links: z
        .object({
          email: z.string().email().optional(),
          facebook: z.string().url().optional(),
          instagram: z.string().url().optional(),
          linkedin: z.string().url().optional(),
          mastodon: z.string().url().optional(),
          threads: z.string().url().optional(),
          twitter: z.string().url().optional(),
          website: z.string().url().optional(),
        })
        .optional(),
    }),
});

const quotes = defineCollection({
  type: "content",
  schema: z.object({
    quotee: z.string(),
  }),
});

const testimonials = defineCollection({
  type: "content",
  schema: z.object({
    teamMember: reference("team").optional(),
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
  team,
  quotes,
  testimonials,
};
