import { getCollection, type CollectionEntry } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";

import { getHeroThemeImagePath } from "@lib/hero-image";

const collectionEntries: Array<CollectionEntry<"atotw">> = await getCollection("atotw");

type TipMapping = {
  [s: string]: CollectionEntry<"atotw">["data"],
}

const pages: TipMapping = Object.fromEntries(
  collectionEntries.map(({ slug, data }) => [slug, data]),
);

export const { getStaticPaths, GET } = OGImageRoute({
  param: "id",
  pages: pages,

  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.summary,
    fonts: [
      "https://api.fontsource.org/v1/fonts/archivo/latin-400-normal.ttf",
      "https://api.fontsource.org/v1/fonts/archivo/latin-700-normal.ttf",
    ],
    font: {
      title: {
        weight: "Bold",
        families: ["Archivo"],
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
      path: getHeroThemeImagePath(page.theme),
      fit: "fill",
      position: ["center", "start"],
    },
    padding: 72,
  }),
});
