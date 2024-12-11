import rss from "@astrojs/rss";
import sanitizeHtml from "sanitize-html";

import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "../../lib/renderer"; // "astro/container"
import { getContainerRenderer as mdxRenderer } from "@astrojs/mdx";

import type { CollectionEntry } from "astro:content";
import { orderByRecent } from "../../lib/tips";
import { components, sanitizeOptions } from "../../lib/mdx";

const renderers = await loadRenderers([mdxRenderer()]);
const container = await AstroContainer.create({ renderers });

export async function GET(context) {
  const tips: Array<CollectionEntry<"atotw">> = await orderByRecent();

  return rss({
    title: "Accessibility Tip of the Week",
    description:
      "Our Tip of the Week is a quick accessibility tip that can improve the accessibility of your website, social media, events, and more.",
    site: `${context.site}/services/tip-of-the-week/`,
    items: await Promise.all(
      tips.map(async (tip) => {
        const { Content } = await tip.render();
        // TODO: Currently no way to embed our CSS into the RSS feed, making these pointless.
        // const postHtml = await container.renderToString(Content, { props: { components }});
        const tipHtml = await container.renderToString(Content);

        return {
          title: tip.data.title,
          pubDate: tip.data.published,
          description: tip.data.summary,
          link: `/tips/${tip.slug}/`,
          content: sanitizeHtml(tipHtml, sanitizeOptions),
        };
      }),
    ),
    customData: `<language>en-us</language>`,
  });
}
