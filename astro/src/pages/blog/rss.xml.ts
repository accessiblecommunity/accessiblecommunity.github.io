import rss from "@astrojs/rss";
import sanitizeHtml from "sanitize-html";

// https://docs.astro.build/en/reference/container-reference/#adding-a-renderer-through-the-container-api
import { loadRenderers } from "astro:container";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as mdxRenderer } from "@astrojs/mdx";

import { render, type CollectionEntry } from "astro:content";
import { orderByRecent } from "../../lib/blog";
import { components, sanitizeOptions } from "../../lib/mdx";

const renderers = await loadRenderers([mdxRenderer()]);
const container = await AstroContainer.create({ renderers });

export async function GET(context) {
  const blogs: Array<CollectionEntry<"blogs">> = await orderByRecent();

  return rss({
    title: "Accessible Community's Blog",
    description:
      "Updates from Accessible Community, including announcements, thoughts, essays and more.",
    site: `${context.site}/blog/`,
    items: await Promise.all(
      blogs.map(async (post) => {
        const { Content } = await render(post);
        // TODO: Currently no way to embed our CSS into the RSS feed, making these pointless.
        // const postHtml = await container.renderToString(Content, { props: { components }});
        const postHtml = await container.renderToString(Content);

        return {
          title: post.data.title,
          pubDate: post.data.published,
          link: `/blog/${post.id}/`,
          content: sanitizeHtml(postHtml, sanitizeOptions),
        };
      }),
    ),
    customData: `<language>en-us</language>`,
  });
}
