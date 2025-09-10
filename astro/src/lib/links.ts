
export type StringOrURL = string | URL

/**
 * Adds an ending slash to the given url, if needed.
 * Currently, doesn't handle parameters or hashes on strings.
 * @param path The url to update
 * @returns The updated url
 */
export function addTrailingSlash(path: StringOrURL): string {
  if (typeof path == "string") {
    // TODO: Doesn't handle parameters or hashes.
    const suffix = path.endsWith("/") ? "" : "/";
    return `${path}${suffix}`;
  }

  path.pathname += path.pathname.endsWith("/") ? "" : "/";
  return path.toString();
}

/**
 * Determine whether two URLs are the same (with or without the ending slash)
 * @param a The first url
 * @param b The second url
 * @returns The whether they are similar
 */
export function areSimilarURLs(a: StringOrURL, b: StringOrURL): boolean {
  const path1: string = addTrailingSlash(a);
  const path2: string = addTrailingSlash(b);
  return path1 == path2;
}