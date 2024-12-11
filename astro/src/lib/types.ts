import { type ImageMetadata } from "astro";

// Breadcrumbs
export interface Breadcrumb {
  name: string;
  href: string | URL;
}
export type Breadcrumbs = Array<Breadcrumb>;

// PageMetadata
export interface PageMetadata {
  title: string;
  description: string;
  image?: ImageData;
  type?: string;
}

export interface ImageData {
  data: ImageMetadata;
  alt: string;
}
