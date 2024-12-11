import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";
import { isEmpty } from "lodash-es";

const collectionEntries = await getCollection("blogs");

const pages = Object.fromEntries(
  collectionEntries.map(({ slug, data }) => [slug, data]),
);

export const { getStaticPaths, GET } = OGImageRoute({
  param: "id",
  pages: pages,

  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.description,
    fonts: [
      "https://api.fontsource.org/v1/fonts/archivo/latin-400-normal.ttf",
      "https://api.fontsource.org/v1/fonts/archivo/latin-700-normal.ttf",
    ],
    font: {
      title: {
        weight: "Bold",
        families: ["Archivo"],
        lineHeight: isEmpty(page.description) ? 1.35 : 1.1,
      },
      description: {
        families: ["Archivo"],
      },
    },
    logo: {
      path: "./src/images/ac-logo-white.png",
      size: [72],
    },
    bgImage: {
      path: "./src/images/colored-hero/pen-paper.png",
      fit: "cover",
    },
    padding: 50,
  }),
});
