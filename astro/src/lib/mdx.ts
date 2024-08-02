/** @module mdx */

import Branding from "../components/Branding.astro";
import Blockquote from "../components/mdx/Blockquote.astro";
import Link from "../components/mdx/Link.astro";

// Options for sanitize-html, to keep RSS clean
export const sanitizeOptions = {
  allowedTags: [
    "p",
    "code",
    "span",
    "b",
    "strong",
    "p",
    "img",
    "figure",
    "figcaption",
    "ul",
    "ol",
    "li",
    "blockquote",
  ],
  // TODO: Determine way of injecting BS rules into CSS XML
  // allowedAttributes: {
  //     "span": [ "class", ],
  // }
};
// MDX Components to translate default Markdown syntax.
export const components = { a: Link, em: Branding, blockquote: Blockquote };
export default components;
