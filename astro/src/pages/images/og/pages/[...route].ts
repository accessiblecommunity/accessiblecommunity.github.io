// src/pages/open-graph/[...route].ts

import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'route',
  pages: {
   'tips': {
      title: 'Accessibility Tip of the Week',
      description: "Once a week, in your inbox, you'll get a simple but effective accessibility tip. It's simple enough to start implementing within the week.",
      bgImage: {
        path: "./src/images/colored-hero/post-it-notes.png",
        fit: 'fill',
        position: ['center', 'start'],
      },
    },
    'team': {
      title: 'Our team',
      description: '',
      bgImage: {
        path: "./src/images/colored-hero/hands-together.png",
        fit: 'cover',
        position: ['center', 'start'],
      },
    },
    'asdf': {
      
    }
  },

  // For each page, this callback will be used to customize the OpenGraph image.
  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.description,
    fonts: [
      'https://api.fontsource.org/v1/fonts/archivo/latin-400-normal.ttf',
      'https://api.fontsource.org/v1/fonts/archivo/latin-700-normal.ttf',
    ],
    font: {
      title: {
        weight: "Bold",
        families: ['Archivo',],
      },
      description: {
        families: ['Archivo',],
      },
    },
    logo: {
      path: "./src/images/ac-logo-white.png",
      size: [72], 
    },
    bgImage: page.bgImage,
  }),
});