/** @module mdx */

import Branding from "../components/Branding.astro";
import Link from "../components/mdx/Link.astro";

// MDX Components to translate default Markdown syntax.
export const components = { a: Link, em: Branding };
export default components;
