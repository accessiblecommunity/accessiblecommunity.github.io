import rss from '@astrojs/rss';
import { orderByRecent } from '@lib/tips';

export async function GET(context) {
  const tips = await orderByRecent();

  return rss({
    title: 'Accessibility Tip of the Week',
    description: 'Our Tip of the Week is a quick accessibility tip that can improve the accessibility of your website, social media, events, and more.',
    site: `${context.site}/services/tip-of-the-week/`,
    items: tips.map((post) => ({
      title: post.data.title,
      pubDate: post.data.published,
      description: post.data.summary,
      customData: '',
      // Compute RSS link from post `slug`
      // This example assumes all posts are rendered as `/blog/[slug]` routes
      link: `/tips/${post.slug}/`,
    })),
    // (optional) inject custom xml
    customData: `<language>en-us</language>`,
  });
}