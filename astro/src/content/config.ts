import { defineCollection, reference, z } from 'astro:content';

// 2. Define a `type` and `schema` for each collection
const blogs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    'date-published': z.date(),
    image: z.string().optional(),
  }),
});


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

const quotes = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    quotee: z.string(),
  }),
})

export const collections = {
  blogs,
  profiles,
  quotes,
};