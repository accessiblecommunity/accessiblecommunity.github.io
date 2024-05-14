// src/pages/open-graph/[...route].ts

import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = OGImageRoute({
  // Tell us the name of your dynamic route segment.
  // In this case it’s `route`, because the file is named `[...route].ts`.
  param: 'route',

  // A collection of pages to generate images for.
  // The keys of this object are used to generate the path for that image.
  // In this example, we generate one image at `/open-graph/example.png`.
  pages: {
   'example': {
     title: 'Example Page',
     description: 'Description of this page shown in smaller text',
   }
  },

  // For each page, this callback will be used to customize the OpenGraph image.
  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.description,
    logo: {
      path: "./src/images/ac-logo-white.png",
      size: [50], 
    },
    bgImage: {
      path: "./src/images/colored-hero/pen-paper.png",
      fit: 'cover',
      position: 'center', 
    }
  }),
});