import { defineCollection, reference, z } from 'astro:content';

const profiles = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    name: z.string(),
    title: z.string(),
    picture: image(),
    tags: z.array(z.string()),
    links: z.object({
      email: z.string().email().optional(),
      facebook: z.string().url().optional(),
      instagram: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      mastodon: z.string().url().optional(),
      threads: z.string().url().optional(),
      twitter: z.string().url().optional(),
    }).optional()
  }),
})

export const collections = {
  profiles,
};