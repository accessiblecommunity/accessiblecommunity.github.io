import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { isEmpty } from 'lodash-es';

const collectionEntries = await getCollection('blogs');

const pages = Object.fromEntries(
  collectionEntries.map(({ slug, data }) => [slug, data])
);

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'route',
  pages: pages,

  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.description,
    font: {
      title: {
        weight: "Bold",
        families: ['Archivo Variable',],
        lineHeight: isEmpty(page.description) ? 1.35 : 1.1,
      },
      description: {
        families: ['Archivo Variable',],
      },
    },
    logo: {
      path: "./src/images/ac-logo-white.png",
      size: [72],
    },
    bgImage: {
      path: "./src/images/colored-hero/pen-paper.png",
      fit: 'cover',
    },
    padding: 50,
  }),
});