import type { ImageData } from "./types";

export function getOpenGraphImageData(
  baseUrl: URL | undefined,
  folder: string,
  filename: string,
  alt: string = "",
): ImageData {
  const url = new URL(`/images/og/${folder}/${filename}.png`, baseUrl || 'https://accessiblecommunity.org');
  return {
    data: {
      src: url.href,
      width: 1200,
      height: 630,
      format: "png",
    },
    alt: alt || "",
  };
}
