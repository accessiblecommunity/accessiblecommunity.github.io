import type { ImageData } from "./types";


export function getOpenGraphImageData(
  host: string,
  folder: string,
  filename: string,
  alt: string = ""
): ImageData {
  return {
    data: {
      src: `${host}/images/og/${folder}/${filename}.png`,
      width: 1200,
      height: 630,
      format: 'png',
    },
    alt: alt || "",
  };
}