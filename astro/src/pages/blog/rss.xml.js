import rss from '@astrojs/rss';
import { orderByRecent } from '../../lib/blog';

export async function GET(context) {
  const blogs = await orderByRecent();

  return rss({
    title: "Accessible Community's Blog",
    description: 'Updates from Accessible Community, including announcements, thoughts, essays and more.',
    site: `${context.site}/blog/`,
    items: blogs.map((post) => ({
      title: post.data.title,
      pubDate: post.data.published,
      description: post.data.summary,
      // Compute RSS link from post `slug`
      // This example assumes all posts are rendered as `/blog/[slug]` routes
      link: `/blog/${post.slug}/`,
    })),
    // (optional) inject custom xml
    customData: `<language>en-us</language>`,
  });
}