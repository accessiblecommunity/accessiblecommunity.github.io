/**
 * Hero Theming Functions.
 */

import { getImage } from "astro:assets";
import type { GetImageResult } from "astro";

// TODO: Figure out how to dynamic import these from the paths
import balloonsImage from "../images/colored-hero/balloons.png";
import blogImage from "../images/colored-hero/pen-paper.png";
import handsImage from "../images/colored-hero/hands-together.png";
import notesImage from "../images/colored-hero/post-it-notes.png";
import podcastImage from "../images/colored-hero/podcast.png";
import policyImage from "../images/colored-hero/policy.png";
import teamImage from "../images/colored-hero/team.png";

export enum HeroTheme {
  blog = "blog",
  hands = "hands",
  notes = "notes",
  party = "party",
  podcast = "podcast",
  policy = "policy",
  team = "team",
}
export type HeroThemeType = `${HeroTheme}`;
export type HeroThemeMapping<T> = {
  [h in HeroTheme]: T;
};

type HeroThemeFunction<T> = (label: HeroThemeType) => T;

const heroImagePaths: HeroThemeMapping<string> = {
  blog: "./src/images/colored-hero/pen-paper.png",
  hands: "./src/images/colored-hero/hands-together.png",
  notes: "./src/images/colored-hero/post-it-notes.png",
  party: "./src/images/colored-hero/balloons.png",
  podcast: "./src/images/colored-hero/podcast.png",
  policy: "./src/images/colored-hero/policy.png",
  team: "./src/images/colored-hero/team.png",
};
const heroImages: HeroThemeMapping<ImageMetadata> = {
  blog: blogImage,
  hands: handsImage,
  notes: notesImage,
  party: balloonsImage,
  podcast: podcastImage,
  policy: policyImage,
  team: teamImage,
};
const heroBackgroundCss: HeroThemeMapping<object> = {
  blog: {
    height: "12rem",
    "background-position": "center bottom",
    "background-size": "cover",
  },
  hands: {
    height: "10rem",
    "background-position": "left center",
  },
  party: {
    height: "12rem",
    "background-position": "center 60%",
    "background-size": "cover",
  },
  policy: {
    height: "8.5rem",
    "background-position": "center 60%",
    "background-size": "cover",
  },
  podcast: {
    height: "11rem",
    "background-position": "center 55%",
    "background-size": "cover",
  },
  team: {
    height: "9rem",
    "background-position": "center 30%",
    "background-size": "cover",
  },
  notes: {
    height: "10rem",
    "background-position": "center 45%",
    "background-size": "cover",
  },
};

export const getHeroThemeImagePath: HeroThemeFunction<string> = (
  label: HeroThemeType,
) => {
  return heroImagePaths[label];
};

export const getHeroThemeImage: HeroThemeFunction<
  Promise<GetImageResult>
> = async (label: HeroThemeType) => {
  return await getImage({ src: heroImages[label], format: "avif" });
};

export const getHeroThemeCssRules: HeroThemeFunction<Promise<object>> = async (
  label: HeroThemeType,
) => {
  const bgImage: GetImageResult = await getHeroThemeImage(label);
  return {
    background: `no-repeat url(${bgImage.src})`,
    ...heroBackgroundCss[label],
  };
};
