import { defineCollection, reference, z } from 'astro:content';

const profiles = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    name: z.string(),
    title: z.string(),
    tags: z.array(z.string()),
    picture: image(),
  }),
})

export const collections = {
  profiles,
};